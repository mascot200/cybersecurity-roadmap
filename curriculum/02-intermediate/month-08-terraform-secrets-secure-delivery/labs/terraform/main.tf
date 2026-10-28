data "aws_caller_identity" "current" {}

# ---- KMS key for the uploads bucket ----
resource "aws_kms_key" "uploads" {
  description             = "${var.name_prefix} uploads bucket key"
  enable_key_rotation     = true
  deletion_window_in_days = 7
}

resource "aws_kms_alias" "uploads" {
  name          = "alias/${var.name_prefix}-uploads"
  target_key_id = aws_kms_key.uploads.key_id
}

# ---- Private, encrypted, versioned bucket ----
resource "aws_s3_bucket" "uploads" {
  bucket        = "${var.name_prefix}-uploads-${data.aws_caller_identity.current.account_id}"
  force_destroy = true # lab only: lets `terraform destroy` remove objects. Never in production.
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    object_ownership = "BucketOwnerEnforced" # ACLs disabled
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.uploads.arn
    }
    bucket_key_enabled = true
  }
}

data "aws_iam_policy_document" "uploads_tls_only" {
  statement {
    sid     = "DenyNonTLS"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.uploads.arn,
      "${aws_s3_bucket.uploads.arn}/*",
    ]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  policy = data.aws_iam_policy_document.uploads_tls_only.json

  # Apply the policy after Block Public Access is in place.
  depends_on = [aws_s3_bucket_public_access_block.uploads]
}
