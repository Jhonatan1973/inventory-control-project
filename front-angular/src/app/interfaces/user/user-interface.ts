export interface UserInterface {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  roleId?: number;
  sectorId?: number;  
  sectorName: string;
  roleName: string;
  lastModified?: string;
  online?: boolean;
  confirmed?: boolean;
}
