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
        root: null, // Use the viewport as the root
        threshold: 1.0, // Trigger when the entire item is in view
      }
    );

    observer.observe(this.el.nativeElement);
  }
}
