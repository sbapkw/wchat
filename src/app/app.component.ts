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
  public end = 50;

  searchText: string = "";
  searchDate: Date = new Date();

  key: string = "";

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

  setMessages = (start: number, end: number) => {
    this.showMessages = this.messsages.slice(start, end)
  }
  
  readTextFile(assetStringName: string) {
    return this.http.get(assetStringName, { responseType: 'text' });
  }
  
  getClass = (message:Message): string =>
  {
    if (message.sender == "Samesh")
    {
      return "left"
    }
    return "right";
  }
  called = () =>
  {
    this.end = this.end + 5;
    this.setMessages(this.start, this.end);
  }
  setChat2 = () =>
  {
      this.readTextFile("assets/chat2-encrypted.txt").subscribe(data =>
      {
          data = this.decrypt(data);
          const lines = data.split('\n')
          lines.forEach(line => {
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
                  if (sender.includes("Samesh"))
                  {
                    messageObj.sender = "Samesh";
                  }
                  else
                  {
                    messageObj.sender = "Pamosha";  
                  }
                  
                  messageObj.message = message;
                  messageObj.index = this.messsages.length;
          
                  this.messsages.push(messageObj);
                }
              }
            
            }
          });
          this.setMessages(this.start, this.end);
        })
  }
  setChat1 = () =>
  {
    this.readTextFile("assets/chat1-encrypted.txt").subscribe(data =>
    {
      //this.encrypt(data,'chat1-encrypted')
      data = this.decrypt(data);
      const lines = data.split('\n')
      lines.forEach(line =>
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
            if (sender.includes("SBA"))
            {
              messageObject.sender = "Samesh";
            }
            else
            {
              messageObject.sender = "Pamosha";
            }
            
            messageObject.message = message;
            messageObject.index = this.messsages.length;

            this.messsages.push(messageObject);

          }
        }
      });
      this.setChat2();
    });
  }
  onKeyDown = () =>
  {
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
}

