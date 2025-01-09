import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Message } from '../Message';

@Component({
  selector: 'app-message-view',
  templateUrl: './message-view.component.html',
  styleUrls: ['./message-view.component.css']
})
export class MessageViewComponent implements OnInit
{

  @Input() max: number = 0;
  @Input() message: Message = new Message();
  @Output() eventEmitter: EventEmitter<number> = new EventEmitter();
  @Input() key: string = "";

  constructor(private el: ElementRef) {}

  ngOnInit(): void
  {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
        {
          // console.log(entry.boundingClientRect.bottom + ' index:' + this.message.index)
          if (entry.isIntersecting && entry.boundingClientRect.bottom > 650)
          {
            this.eventEmitter.emit(this.message.index);
          }
          else if(this.message.index >= this.max - 1)
          {
            this.eventEmitter.emit(this.max);
          }
          
        });
      },
      {
        root: null,
        threshold: 1.0,
      }
    );

    observer.observe(this.el.nativeElement);
  }

getClass(message: Message): string
{
  if (message.sender.toUpperCase().startsWith("❤️ P ❤️"))
  {
    return 'other-color';  
  }
  return '';
  }  
  getDateTime = () =>
  {
    let hour = "" + this.message.date.getHours();
    let minute = "" + this.message.date.getMinutes();

    if (this.message.date.getHours() < 10)
    {
      if (this.message.date.getHours() == 0)
      {
        hour = "00";
      }
      else
      {
        hour = "0" + this.message.date.getHours();
      }
    }
    if (this.message.date.getMinutes() < 10)
    {
      if (this.message.date.getMinutes() == 0)
      {
        minute = "00";
      }
      else
      {
        minute = "0" + this.message.date.getMinutes(); 
      }
    }
    return hour + ":" + minute;
  }
}


