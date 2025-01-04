import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Message } from './Message';
import * as CryptoJS from 'crypto-js';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit
{
  title = 'wchat';

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
    this.route.queryParams.subscribe(params =>
    {
      if (params['key'] != null)
      {
        this.key = params['key'];
        this.setChat1();
      }
    });
  }

  setMessages = (start: number, end: number) =>
  {
    const newMessages = this.messsages.slice(start, end);
    const undescryptedMesages = newMessages.filter(message => !message.decrypted);
    this.decryptMessageList(undescryptedMesages);
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
  setChat2 = () =>
  {
      this.readTextFile("assets/chat2-line-encrypted.txt").subscribe(data =>
      { 
        const lines = data.split('\n')
        
        lines.forEach(line =>
        {
          //this.encrypt2(line);
          if (this.messsages.length > this.end)
          {
            this.extractChat2Line(line, false);
          }
          else
          {
            line = this.decrypt(line);
            this.extractChat2Line(line, true);
          }
          
        });
        //this.saveFile(this.encryptedLines, 'chat2-line-encrypted')
        this.setMessages(this.start, this.end);
      })
  }
  setChat1 = () =>
  {
    this.readTextFile("assets/chat1-line-encrypted.txt").subscribe(data =>
    {
      const lines = data.split('\n')
      lines.forEach(line =>
      { 
        //this.encrypt2(line);
        if (this.messsages.length > this.end)
        {
          this.extractChat1Line(line,false);
        }
        else
        {
          line = this.decrypt(line)
          this.extractChat1Line(line,true);
        }
      });

      //this.saveFile(this.encryptedLines, 'chat1-line-encrypted')
      this.setChat2();
    });
  }
  onKeyDown = () =>
  {
    const encryptedMessages = this.messsages.filter(message => !message.decrypted);
    this.decryptMessageList(encryptedMessages);

    const filtered = this.messsages.filter(message => message.message.toUpperCase().includes(this.searchText.toUpperCase()))
    this.showMessages = filtered;
  }
  dateChanged = () =>
  {
    const filtered = this.messsages.filter(message => message.date.toLocaleDateString() == this.searchDate.toLocaleDateString());
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
  encrypt = (data:any, name:string) =>
  {
    var ciphertext = CryptoJS.AES.encrypt(data, this.key).toString();
    this.saveFile(ciphertext,name)
  }
  decrypt = (data: any): string =>
  {
    var bytes  = CryptoJS.AES.decrypt(data, this.key);
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  }
  encrypt2 = (data:string) =>
  {
    var ciphertext = CryptoJS.AES.encrypt(data, this.key).toString();
    ciphertext = ciphertext + "\r\n";
    this.encryptedLines  = this.encryptedLines + ciphertext;
  }

  extractChat1Line = (line:string, decrypt: boolean) =>
  {
    if (decrypt)
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

          let messageObject = new Message();
          messageObject.date = new Date(date);
          if (sender.toUpperCase().startsWith("S"))
          {
            messageObject.sender = "❤️ S ❤️";
          }
          else
          {
            messageObject.sender = "❤️ P ❤️";
          }
          
          messageObject.index = this.messsages.length;
          messageObject.message = message;
          messageObject.decrypted = true;

          this.messsages.push(messageObject);

        }
      }
    }
    else
    {
      const messageObj = new Message();  
      messageObj.encryptedText = line;
      messageObj.decrypted = false;
      messageObj.source = "chat1";
      messageObj.index = this.messsages.length
      this.messsages.push(messageObj);
    }
  }

  extractChat2Line = (line: string, decrypt: boolean) =>
  {
    if (decrypt)
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
    
            const messageObj = new Message();
            messageObj.date = this.parseCustomDate(date);
            if (sender.toUpperCase().startsWith("S"))
            {
              messageObj.sender = "❤️ S ❤️";
            }
            else
            {
              messageObj.sender = "❤️ P ❤️";  
            }
            
            messageObj.index = this.messsages.length;
            messageObj.message = message;
            messageObj.decrypted = true;
    
            this.messsages.push(messageObj);
          }
        }
      
      }
    }
    else
    {
      const messageObj = new Message();
      messageObj.encryptedText = line;
      messageObj.decrypted = false;
      messageObj.source = 'chat2';
      messageObj.index = this.messsages.length;
      this.messsages.push(messageObj);
    }
  }
  extractChat1Message = (messageObject:Message) =>
    {
      const line = this.decrypt(messageObject.encryptedText);
      const split1 = line.split(']');
      if (split1[0] && split1[1])
      {
    
        const date = split1[0].split("[")[1].trim();
        const split2 = split1[1].split(":");
    
        if (split2[0] && split2[1])
        {
          const sender = split2[0].trim();
          const message = split2[1].trim();
    
          messageObject.date = new Date(date);
          if (sender.toUpperCase().startsWith("S"))
          {
            messageObject.sender = "❤️ S ❤️";
          }
          else
          {
            messageObject.sender = "❤️ P ❤️";
          }
          
          messageObject.message = message;
          messageObject.decrypted = true;
        }
      }
    }
      
    extractChat2Message = (messageObj:Message) =>
    {
      const line = this.decrypt(messageObj.encryptedText);
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
    
            messageObj.date = this.parseCustomDate(date);
            if (sender.toUpperCase().startsWith("S"))
            {
              messageObj.sender = "❤️ S ❤️";
            }
            else
            {
              messageObj.sender = "❤️ P ❤️";  
            }
            
            messageObj.message = message;
            messageObj.decrypted = true;
          }
        }
      
      }
    }
  decryptMessageList = (messages: Message[]) =>
  {
    messages.forEach(message =>
    {
        if (message.source == 'chat1')
        {
          this.extractChat1Message(message);
        }
        else if (message.source == 'chat2')
        {
          this.extractChat2Message(message);
        }
    });  
  }
}

