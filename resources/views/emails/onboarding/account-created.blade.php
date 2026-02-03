<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Your Account is Ready - Rocket Partners</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; line-height: 1.6;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
        <tr>
            <td align="center">

                <!-- Main Container -->
                <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);">

                    <!-- Header with Logo -->
                    <tr>
                        <td style="background-color: #16a34a; padding: 50px 40px; text-align: center;">

                            <!-- Logo with Black Background -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 28px;">
                                        <div style="background-color: #000000; display: inline-block; padding: 20px 50px; border-radius: 12px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);">
                                            <img src="{{ config('app.url') }}/images/logo.png" alt="Rocket Partners" style="height: 50px; width: auto; display: block;">
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <h1 style="margin: 0 0 12px 0; font-size: 38px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.1); letter-spacing: -0.5px;">
                                Your Account is Ready!
                            </h1>
                            <p style="margin: 0; font-size: 19px; color: #ffffff; opacity: 0.95; font-weight: 500;">
                                Welcome to the Rocket Partners team
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 45px 40px;">

                            <!-- Greeting -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td>
                                        <h2 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: #0f172a;">
                                            Hi {{ $firstName }}!
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.8;">
                                            Great news! Your onboarding has been approved and your <strong style="color: #16a34a;">Rocket Partners</strong> account has been created. You can now access all systems and tools.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Success Banner -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 36px;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 2px solid #16a34a; border-radius: 12px; padding: 24px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="40" style="vertical-align: top;">
                                                    <div style="background-color: #16a34a; width: 40px; height: 40px; border-radius: 50%; text-align: center; line-height: 40px; font-size: 20px; color: #ffffff;">
                                                        ✓
                                                    </div>
                                                </td>
                                                <td style="padding-left: 16px; vertical-align: middle;">
                                                    <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #15803d;">
                                                        Account Activated
                                                    </p>
                                                    <p style="margin: 0; font-size: 15px; color: #16a34a;">
                                                        Your credentials are ready to use
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Login Credentials Section -->
                            <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                                Your Login Credentials
                            </h3>

                            <!-- Credentials Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px; background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 28px;">

                                        <!-- Work Email -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                            <tr>
                                                <td>
                                                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                                        Work Email
                                                    </p>
                                                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                                        {{ $workEmail }}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Temporary Password -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                                                        Temporary Password
                                                    </p>
                                                    <p style="margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                                        {{ $temporaryPassword }}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <!-- Important Note -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 8px;">
                                        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                                            <strong style="color: #78350f;">Important:</strong> You will be required to change this temporary password on your first login for security purposes.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Login Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $loginUrl }}" style="display: inline-block; background-color: #2596be; color: #ffffff; font-size: 18px; font-weight: 700; text-decoration: none; padding: 16px 48px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 150, 190, 0.35); transition: all 0.3s;">
                                            Log In to Your Account
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Link Alternative -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">
                                            Or copy and paste this link into your browser:
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #2596be; word-break: break-all;">
                                            {{ $loginUrl }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Next Steps -->
                            <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                                Next Steps
                            </h3>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                            <tr>
                                                <td width="32" style="vertical-align: top;">
                                                    <div style="background-color: #2596be; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">1</div>
                                                </td>
                                                <td style="padding-left: 12px;">
                                                    <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6;">
                                                        <strong style="color: #0f172a;">Log in</strong> using your work email and temporary password
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                                            <tr>
                                                <td width="32" style="vertical-align: top;">
                                                    <div style="background-color: #2596be; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">2</div>
                                                </td>
                                                <td style="padding-left: 12px;">
                                                    <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6;">
                                                        <strong style="color: #0f172a;">Change your password</strong> when prompted
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="32" style="vertical-align: top;">
                                                    <div style="background-color: #2596be; color: #ffffff; width: 28px; height: 28px; border-radius: 50%; text-align: center; line-height: 28px; font-weight: 700; font-size: 13px;">3</div>
                                                </td>
                                                <td style="padding-left: 12px;">
                                                    <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6;">
                                                        <strong style="color: #0f172a;">Explore</strong> your dashboard and available tools
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Help Section -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                <tr>
                                    <td style="background-color: #f1f5f9; border-radius: 10px; padding: 20px; text-align: center;">
                                        <p style="margin: 0 0 8px 0; font-size: 15px; color: #475569;">
                                            Need help getting started?
                                        </p>
                                        <p style="margin: 0; font-size: 15px; color: #475569;">
                                            Contact HR at <a href="mailto:hr@rocketpartners.com" style="color: #2596be; text-decoration: none; font-weight: 600;">hr@rocketpartners.com</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Closing -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 12px 0; font-size: 16px; color: #334155; line-height: 1.7;">
                                            We're excited to have you on the team!
                                        </p>
                                        <p style="margin: 0; font-size: 16px; color: #334155; line-height: 1.7;">
                                            Best regards,<br>
                                            <strong style="color: #0f172a;">The Rocket Partners Team</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b;">
                                            <strong style="color: #334155;">Rocket Partners</strong>
                                        </p>
                                        <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                                            This is an automated message. Please do not reply to this email.
                                        </p>
                                        <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8;">
                                            &copy; {{ date('Y') }} Rocket Partners. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
