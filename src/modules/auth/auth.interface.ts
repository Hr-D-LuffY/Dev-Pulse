export interface Iuser {
	name: string;
	email: string;
	password: string;
	role?: string;
}
export interface IuserLogin {
	email: string;
	password: string;
}
