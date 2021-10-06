export enum ArticleType {
	Article = 0,
	Page = 1,
	Document = 2
}

export interface Base64EncodedImage {
	mime?: string;
	filename?: string;
	content: string;
}
