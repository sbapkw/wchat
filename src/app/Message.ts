import { ContentType } from "./ContentType";

export class Message
{
    public index: number = 0;
    public date: Date = new Date();
    public sender: string = "";
    public message: string = "Encrypted Text";
    public decrypted: boolean = false;
    public encryptedText: string = "";
    public source: ContentType = ContentType.CONTENT1;
}