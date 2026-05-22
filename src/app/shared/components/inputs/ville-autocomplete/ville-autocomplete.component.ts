import { Component, DestroyRef, Input, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TextComponent } from '../text/text.component';
import { UserApiService } from '@core/services/user-api.service';
import { Ville } from '@core/models/user.model';

@Component({
  selector: 'app-ville-autocomplete',
  imports: [TextComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './ville-autocomplete.component.html',
  styleUrl: './ville-autocomplete.component.css',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    }
  ]
})
export class VilleAutocompleteComponent implements OnInit {
  @Input() controlName = 'ville';

  private controlContainer = inject(ControlContainer);
  private userApiService = inject(UserApiService);
  private destroyRef = inject(DestroyRef);

  villes: Ville[] = [];

  get form(): FormGroup {
    return this.controlContainer.control as FormGroup;
  }

  ngOnInit() {
    const control = this.form.get(this.controlName);
    if (!control) return;
    control.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value?.trim()) return of([]);
          return this.userApiService.searchVilles(value);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result: Ville[]) => {
        this.villes = result;
      });
  }

  selectVille(ville: Ville) {
    this.form.patchValue(
      { [this.controlName]: ville.name, [`${this.controlName}Id`]: ville.id },
      { emitEvent: false }
    );
    this.villes = [];
  }
}
