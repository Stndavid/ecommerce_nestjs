import { SetMetadata } from "@nestjs/common";
import { JwtRole } from "./jwt-role";

export const HastRoles = (...roles:JwtRole[]) => SetMetadata('roles', roles);