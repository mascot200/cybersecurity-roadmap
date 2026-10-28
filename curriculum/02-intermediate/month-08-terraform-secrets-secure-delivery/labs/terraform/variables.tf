variable "region" {
  description = "AWS region for the lab"
  type        = string
  default     = "eu-west-1"
}

variable "name_prefix" {
  description = "Prefix for resource names (lowercase, no spaces)"
  type        = string
  default     = "invoices-lab"

  validation {
    condition     = can(regex("^[a-z0-9-]{3,30}$", var.name_prefix))
    error_message = "name_prefix must be 3-30 characters: lowercase letters, digits and hyphens."
  }
}
