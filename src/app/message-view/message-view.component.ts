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
  @Output() eventEmitter: EventEmitter<void> = new EventEmitter();

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && this.max - 1 == this.message.index)
          {
            this.eventEmitter.emit();
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
}
