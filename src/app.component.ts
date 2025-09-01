
import { Component, signal } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { DotMatrixComponent } from './components/dot-matrix/dot-matrix.component';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';
import { type Settings } from './settings.type';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DotMatrixComponent, SettingsPanelComponent],
})
export class AppComponent {
  isSettingsOpen = signal(false);

  settings = signal<Settings>({
    density: 20,
    dotSize: 2,
    interactionRadius: 80,
    repelForce: 0.8,
    returnSpeed: 0.05,
    damping: 0.92,
    hueShift: 90,
    baseHue: 200,
  });

  toggleSettings(): void {
    this.isSettingsOpen.update(open => !open);
  }
}
