import { Component, Input, inject } from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-text',
  imports: [ReactiveFormsModule],
  templateUrl: './text.component.html',
  styleUrl: './text.component.css',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    }
  ]
})
export class TextComponent {
  @Input() controlName!: string;
  @Input() label!: string;
  @Input() type = 'text';
  @Input() inputClass!: string;
  @Input() placeholder!: string;
  @Input() name!: string;
}
