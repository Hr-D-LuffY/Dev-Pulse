export interface ICreateIssue {
	title: string;
	description: string;
	type: string;
	reporter_id: number;
}

export interface IIssueFilters {
	type?: string;
	status?: string;
	sort?: string;
}

export interface IUpdateIssue {
	title?: string;
	description?: string;
	type?: string;
}

export interface IIssueRow {
	id: number;
	title: string;
	description: string;
	type: string;
	status: string;
	reporter_id: number;
	created_at: Date;
	updated_at: Date;
}
