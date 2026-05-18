import { UserRole } from "../../common/enums/user-role.enum";

export type AuthUser = {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  role: UserRole;
};
