import argparse
import boto3
from os import listdir
from os import path
from os import fsync
import json
import subprocess

PRODUCTION_BUCKET_NAME = 'stacktape-infrastructure-modules'
BUCKET_KEY_PREFIX = 'upstashRedis'
ROLE_DEFINITION_FILE_NAME = 'resource-role.yaml'


def rewrite_file_content(file_handler, new_content):
    file_handler.seek(0)
    file_handler.write(new_content)
    file_handler.truncate()
    file_handler.flush()
    fsync(file_handler.fileno())


def modify_schema_content(original_content, subversion):
    modified_schema = json.loads(original_content)
    modified_schema['description'] = subversion
    return json.dumps(modified_schema)


def build_resource_package(relative_path_to_resource_directory, subversion):

    json_files = [f for f in listdir(
        relative_path_to_resource_directory) if f.endswith('.json') and not f in ['package.json', 'package-lock.json', 'tsconfig.json']]
    # find json file (its name). only one should be present
    print(json_files)
    if len(json_files) != 1:
        raise Exception('There should be exactly one json file (schema) in {} directory (except for json files pre-created by CF typescript plugin)'.format(
            relative_path_to_resource_directory))
    # load json file (schema)
    with open(path.join(relative_path_to_resource_directory, json_files[0]), 'r+') as schema_file:
        original_schema_content = schema_file.read()
        print('building package for {}'.format(
            relative_path_to_resource_directory))
        try:
            modified_schema_content = modify_schema_content(
                original_schema_content, subversion)
            rewrite_file_content(schema_file, modified_schema_content)
            subprocess.run(
                ['yarn', 'build'], cwd=relative_path_to_resource_directory).check_returncode()
            subprocess.run(['cfn', 'submit', '--dry-run'],
                           cwd=relative_path_to_resource_directory).check_returncode()

        except:
            print('building package for {} FAILED'.format(
                relative_path_to_resource_directory))
            rewrite_file_content(schema_file, original_schema_content)
            # after we rewrite content back, we need to regenerate cfn schema due to docs
            subprocess.run(['cfn', 'generate'],
                           cwd=relative_path_to_resource_directory).check_returncode()
            raise

        rewrite_file_content(schema_file, original_schema_content)
        # after we rewrite content back, we need to regenerate cfn schema due to docs
        subprocess.run(['cfn', 'generate'],
                       cwd=relative_path_to_resource_directory).check_returncode()
    print('building package for {} SUCCESS'.format(
        relative_path_to_resource_directory))


def check_subversion_existence(s3_client, bucket_name, major_version, subversion):
    if len(subversion) != 7 or not subversion.isnumeric():
        raise Exception('Invalid format of subversion {}'.format(subversion))
    full_version_prefix = '{}/{}/{}'.format(
        BUCKET_KEY_PREFIX, major_version, subversion)
    response = s3_client.list_objects_v2(
        Bucket=bucket_name, Prefix=full_version_prefix)
    print(json.dumps(response, indent=2, default=str))
    if ('Contents' in response) and (len(response['Contents']) > 0):
        print('Prefix {} already exists in bucket {}'.format(
            full_version_prefix, bucket_name))
        return True
    return False


def upload_resource_package(relative_path_to_resource_directory, s3_client, bucket_name, major_version, subversion):
    full_version_prefix = '{}/{}/{}'.format(
        BUCKET_KEY_PREFIX, major_version, subversion)
    zip_files = [f for f in listdir(
        relative_path_to_resource_directory) if f.endswith('.zip')]
    # find zip file (its name). only one should be present
    if len(zip_files) != 1:
        raise Exception('There should be exactly one zip file (resource package) in {} directory'.format(
            relative_path_to_resource_directory))
    print('uploading {} into {}/{}/{}'.format(
        zip_files[0], bucket_name, full_version_prefix, zip_files[0]))
    s3_client.upload_file(Filename='{}/{}'.format(relative_path_to_resource_directory,
                                                  zip_files[0]), Bucket=bucket_name, Key='{}/{}'.format(full_version_prefix, zip_files[0]))
    print('package upload success')
    role_definition_bucket_key = '{}/{}-role.yml'.format(
        full_version_prefix, zip_files[0].split('.')[0])
    print('uploading {} into {}/{}'.format(
        ROLE_DEFINITION_FILE_NAME, bucket_name, role_definition_bucket_key))
    s3_client.upload_file(Filename='{}/{}'.format(relative_path_to_resource_directory,
                                                  ROLE_DEFINITION_FILE_NAME), Bucket=bucket_name, Key=role_definition_bucket_key)
    print('uploading role definition success')


def resolve_resource_packages_for_major_version(s3_client, bucket_name, major_version, subversion):
    # for every directory in the cfn-version/<<major_version>> directory
    # each directory represents a resource
    for resource_dir_name in listdir(path.join('cfn-resources', major_version)):
        full_resource_dir = path.join(
            'cfn-resources', major_version, resource_dir_name)
        print('building resource package in directory: {}/{}'.format(major_version, resource_dir_name))
        build_resource_package(
            relative_path_to_resource_directory=full_resource_dir, subversion=subversion)
        print(
            'uploading package of directory: {}/{}'.format(major_version, resource_dir_name))
        upload_resource_package(relative_path_to_resource_directory=full_resource_dir,
                                s3_client=s3_client, bucket_name=bucket_name, major_version=major_version, subversion=subversion)


parser = argparse.ArgumentParser()
parser.add_argument('--major-version', required=True)
parser.add_argument('--subversion', required=True)
parser.add_argument('--bucket-name', required=True)
parser.add_argument('--bucket-region', required=True)

args = vars(parser.parse_args())

s3 = boto3.client('s3', region_name=args['bucket_region'])

subversion_exists = check_subversion_existence(
    s3_client=s3, bucket_name=args['bucket_name'], major_version=args['major_version'], subversion=args['subversion'])

if subversion_exists and args['bucket_name'] == PRODUCTION_BUCKET_NAME:
    raise Exception('{}/{}/{} already exists in production bucket. You CANNOT override version in production bucket'.format(
        BUCKET_KEY_PREFIX, args['major_version'], args['subversion']))

resolve_resource_packages_for_major_version(
    s3_client=s3, bucket_name=args['bucket_name'], major_version=args['major_version'], subversion=args['subversion'])
