import * as Yup from 'yup'

export const forgotPasswordEmailSchema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email').required('Email is required'),
})

export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must include a lowercase letter')
    .matches(/[A-Z]/, 'Password must include an uppercase letter')
    .matches(/[0-9]/, 'Password must include a number')
    .required('New password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your new password'),
})
