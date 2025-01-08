import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Message } from './Message';
import * as CryptoJS from 'crypto-js';
import { ActivatedRoute } from '@angular/router';
import { ContentType } from './ContentType';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit
{
  title = 'Memories';

  messsages: Message[] = [];
  public showMessages: Message[] = [];
  public start = 0;
  public end = 25;

  searchText: string = "";
  searchDate: Date = new Date();

  key: string = "";

  encryptedLines: string = "";

  lastMaxScrolledIndex: number = -1;

  constructor(private http: HttpClient, private route: ActivatedRoute)
  { 
    
  }

  ngOnInit(): void
  {
    this.route.queryParams.subscribe(async params =>
    {
      if (params['key'] != null)
      {
        this.key = params['key'];
        for (let i = 1; i <= 35; i++)
        {
          await this.readTextFileSync('assets/content1/content_1.0.' + i + '.txt', ContentType.CONTENT1);
          if (i == 1)
          {
            this.setMessages(this.start, this.end);
          }
        }
        for (let i = 1; i <= 9; i++)
        {
          await this.readTextFileSync('assets/content2/content_2.0.' + i + '.txt', ContentType.CONTENT2);
        }
        
      }
      if (params['encrypt'] != null)
      {
        this.encryptChatLines("assets/content_2.0.0.txt", "content_2.0.0-line-encrypted", ContentType.CONTENT2);
      }
    });
  }

  setMessages = (start: number, end: number) =>
  {
    const newMessages = this.messsages.slice(start, end);
    this.decryptMessageList(newMessages);
    this.showMessages = [...this.showMessages,...newMessages]
  }
  
  readTextFile(assetStringName: string) {
    return this.http.get(assetStringName, { responseType: 'text' });
  }
  
  getClass = (message:Message): string =>
  {
    if (message.sender.toUpperCase().startsWith("❤️ S ❤️"))
    {
      return "left"
    }
    return "right";
  }
  called = (index:number) =>
  {
    if (index > this.lastMaxScrolledIndex)
    {
      const newEnd = this.end + 2;
      this.setMessages(this.end, newEnd);
      this.end = newEnd;
      this.lastMaxScrolledIndex = index;
    }
  }
  encryptChatLines = (inputFileName:string, outputFileName:string, contentType:ContentType) =>
  {
    this.encryptedLines = "";
    this.readTextFile(inputFileName).subscribe(data =>
    {
      const lines = data.split('\n')
      lines.forEach(line =>
      { 
        this.encryptLine(line,contentType);
      });

      this.saveFile(this.encryptedLines, outputFileName)
    });
  }
  onKeyDown = () =>
  {
    this.decryptMessageList(this.messsages);
    const filtered = this.messsages.filter(message => message.message.toUpperCase().includes(this.searchText.toUpperCase()))
    this.showMessages = filtered;
  }
  dateChanged = () =>
  {
    const filtered = this.messsages.filter(message => message.date.toLocaleDateString() == this.searchDate.toLocaleDateString());
    this.decryptMessageList(filtered);
    this.showMessages = filtered;
  }
   parseCustomDate = (dateString:string) => {
    // Split the input into date and time parts
    const [datePart, timePart] = dateString.split(', ');
    
    // Rearrange the date part from DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = datePart.split('/');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Combine the formatted date and time
    const isoString = `${formattedDate}T${timePart}`;
    
    // Create and return a Date object
    return new Date(isoString);
   }
   saveFile(value: string, filename: string) {
    const blob = new Blob([value], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.txt`;
    a.click();
  
    window.URL.revokeObjectURL(url);
   }
  
  decrypt = (data: any): string =>
  {
    var bytes  = CryptoJS.AES.decrypt(data, this.key);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  }

  encryptString = (data:string) =>
  {
      return CryptoJS.AES.encrypt(data, this.key).toString();
  }

  extractNewLine = (line: string, decrypt: boolean, contentType:ContentType): Message =>
  {
    const messageObj = new Message();
    const splitted = line.split("~");
    const date = splitted[0].trim();
    if (decrypt) {
      if (splitted[0] && splitted[1]) {
          
        const decrypted = this.decrypt(splitted[1]);
        const splitted2 = decrypted.split("~")
          
        if (splitted2[0] && splitted2[1]) {
          const sender = splitted2[0];
          const message = splitted2[1];
    
            
          if (contentType == ContentType.CONTENT2) {
            messageObj.date = this.parseCustomDate(date);
          }
          if (contentType == ContentType.CONTENT1) {
            messageObj.date = new Date(date);
          }
          if (sender.toUpperCase().startsWith("S")) {
            messageObj.sender = "❤️ S ❤️";
          }
          else {
            messageObj.sender = "❤️ P ❤️";
          }
            
          messageObj.index = this.messsages.length;
          messageObj.message = message;
          messageObj.decrypted = true;
          messageObj.source = contentType;
        }
      }
      
    }
    else {
      messageObj.encryptedText = line;
      messageObj.decrypted = false;
      messageObj.index = this.messsages.length;
      messageObj.source = contentType;
      if (contentType == ContentType.CONTENT2) {
        messageObj.date = this.parseCustomDate(date);
      }
      if (contentType == ContentType.CONTENT1) {
        messageObj.date = new Date(date);
      }
    }
    return messageObj;
  }

  decryptMessageList = (messages: Message[]) =>
  {
    messages.forEach(message =>
    {
      if (!message.decrypted)
      {
        const newMessage = this.extractNewLine(message.encryptedText, true, message.source);
        message.sender = newMessage.sender;
        message.message = newMessage.message;
      }
    });  
  }

  async readTextFileSync(assetStringName: string, contentType:ContentType): Promise<string>
  {
    try
    {
      const response = await this.http.get(assetStringName, { responseType: 'text' }).toPromise();
      this.setContent(response as string,contentType);
      return response as string;
    }
    catch (error)
    {
      console.error('Error reading the file:', error);
      throw error;
    }
  }
  setContent = (data:string,contentType:ContentType) =>
  {
    const lines = data.split('\n')
    lines.forEach(line =>
    { 
      if (this.messsages.length > this.end)
      {
        const messageObj = this.extractNewLine(line, false, contentType);
        this.messsages.push(messageObj);
      }
      else
      {
        const messageObj = this.extractNewLine(line, true, contentType);
        this.messsages.push(messageObj);
      }
    });
  }
  encryptLine = (line:string,contentType:ContentType) =>
  {
    if (contentType == ContentType.CONTENT1)
    {
      const split1 = line.split(']');
      if (split1[0] && split1[1])
      {
  
        const date = split1[0].split("[")[1].trim();
        const split2 = split1[1].split(":");
  
        if (split2[0] && split2[1])
        {
          const sender = split2[0].trim();
          const message = split2[1].trim();
  
          let encryptedPart = this.encryptString(sender + "~" + message);
          let text = date + "~" + encryptedPart + "\r\n";
          this.encryptedLines  = this.encryptedLines + text;
        }
      }
    }
    if (contentType == ContentType.CONTENT2)
    {
      const splitted = line.split("-");
      if (splitted)
      {
        if (splitted[0] && splitted[1])
        {
          const date = splitted[0].trim();
          const splitted2 = splitted[1].split(":");
          if (splitted2[0] && splitted2[1])
          {
            const sender = splitted2[0].trim();
            const message = splitted2[1].trim();

            let encryptedPart = this.encryptString(sender + "~" + message);
            let text = date + "~" + encryptedPart + "\r\n";
            this.encryptedLines  = this.encryptedLines + text;
          }
        }
      
      }
    }
  }
}

