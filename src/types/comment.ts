export interface Comment {
  id: string | number;
  author: string;
  avatar: string;
  time: string;
  votes: number;
  content: string;
  isOp?: boolean;
  children?: Comment[];
}
