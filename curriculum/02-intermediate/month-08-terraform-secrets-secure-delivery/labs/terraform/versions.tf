terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote state: encrypted, versioned bucket with native S3 locking (Terraform >= 1.10).
  # Create the state bucket once by hand or with a separate bootstrap config (Week 32).
  backend "s3" {
    bucket       = "REPLACE-tfstate-111122223333-eu-west-1"
    key          = "invoices/lab.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      project    = "cyber-lab"
      managed-by = "terraform"
    }
  }
}
