import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, createParamDecorator } from "@nestjs/common";
import { AuthService, TokenPayload } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    let token: string | undefined;

    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies["access_token"]) {
      token = req.cookies["access_token"];
    }

    if (!token) {
      throw new UnauthorizedException("Missing authentication token");
    }

    const payload = this.authService.verifyToken(token);
    req.user = payload;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TokenPayload | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
