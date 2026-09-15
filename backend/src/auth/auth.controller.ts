import { Controller, Post, Get, Body, Res, Req, Query, UseGuards, HttpStatus } from "@nestjs/common";
import { Response, Request } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto, GoogleLoginDto, ForgotPasswordDto, ResetPasswordDto } from "./dto/auth.dto";
import { AuthGuard, CurrentUser } from "./auth.guard";
import { TokenPayload } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600 * 1000,
    });
    return result;
  }

  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600 * 1000,
    });
    return result;
  }

  @Post("google")
  async googleLogin(@Body() dto: GoogleLoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.googleLogin(dto);
    res.cookie("access_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 3600 * 1000,
    });
    return result;
  }

  @UseGuards(AuthGuard)
  @Get("me")
  async getMe(@CurrentUser() user: TokenPayload) {
    return this.authService.getProfile(user.sub);
  }

  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token");
    return { success: true, message: "Logged out successfully" };
  }

  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip;
    const result = await this.authService.forgotPassword(dto, clientIp);
    // Never reveal raw token in production API response
    return { message: result.message };
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get("verify-reset-token")
  async verifyResetToken(@Query("token") token: string) {
    return this.authService.verifyResetToken(token);
  }
}
