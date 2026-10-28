output "uploads_bucket" {
  description = "Name of the uploads bucket"
  value       = aws_s3_bucket.uploads.bucket
}

output "uploads_kms_key_arn" {
  description = "ARN of the KMS key encrypting the bucket"
  value       = aws_kms_key.uploads.arn
}
