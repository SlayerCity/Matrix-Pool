
import { Component, ChangeDetectionStrategy, input, model } from '@angular/core';
import { type Settings } from '../../settings.type';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  templateUrl: './settings-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPanelComponent {
  isOpen = input.required<boolean>();
  settings = model.required<Settings>();

  updateSetting(key: keyof Settings, value: string) {
    this.settings.update(s => ({ ...s, [key]: Number(value) }));
  }

  // A helper to create unique IDs for accessibility
  getSliderId(key: keyof Settings): string {
    return `slider-${key}`;
  }
}
