pipeline {
  agent any

  environment {
    AWS_REGION = "us-east-1"
    AWS_S3_BUCKET = "gs-vtk-storybook"
    SOURCE_DIR = "storybook-static"
  }
  stages {
    stage('Build Storybook') {
      agent {
        docker {
          image 'node:22-alpine'
          args '--entrypoint=""'
        }
      }
      steps {
        script {
          sh '''
              yarn install --frozen-lockfile
              yarn build-storybook
            '''
          echo "✅ Storybook deployed successfully to S3!"
        }
      }
    }
    stage('Deploy Storybook') {
      agent {
        docker {
          image 'amazon/aws-cli'
          args '--entrypoint=""'
        }
      }
      steps {
        script {
          withAWS(credentials: 'aws-gs-vtk-deployer', region: env.AWS_REGION) {
            sh '''
              aws s3 sync ${SOURCE_DIR}/ s3://${AWS_S3_BUCKET}/ --delete --acl public-read
              rm -rf ${SOURCE_DIR}/
            '''
          }
        }
      }
    }
  }
  post {
    success {
      echo "Storybook successfully deploy"
    }
    failure {
      echo "❌ Pipeline failed! Check logs for errors."
    }
    always {
      cleanWs()
    }
  }
}
