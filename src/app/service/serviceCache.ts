import { Observable, of } from 'rxjs';
import * as equal from "fast-deep-equal"

export class ServiceCache<I, O> {
  public observable$: Observable<O | null> = of(null);
  public previousInput: I | null;

  public constructor() {
    this.observable$ = of(null);
    this.previousInput = null;
  }

  public shouldUseCache(input: I): boolean {
    return equal(this.previousInput, input);
  }

  public clear(): void {
    this.observable$ = of(null);
    this.previousInput = null;
  }
}
