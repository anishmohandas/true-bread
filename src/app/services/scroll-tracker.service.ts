import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollTrackerService {
  // Track if we're in the latest issue section
  private _inLatestIssueSection = new BehaviorSubject<boolean>(false);
  public inLatestIssueSection$ = this._inLatestIssueSection.asObservable();

  // Track if we've scrolled past the latest issue section
  private _pastLatestIssueSection = new BehaviorSubject<boolean>(false);
  public pastLatestIssueSection$ = this._pastLatestIssueSection.asObservable();

  constructor() { }

  /**
   * Update the state when entering or leaving the latest issue section
   * @param inSection Whether we're currently in the latest issue section
   */
  setInLatestIssueSection(inSection: boolean): void {
    this._inLatestIssueSection.next(inSection);
  }

  /**
   * Update the state when scrolling past the latest issue section
   * @param pastSection Whether we've scrolled past the latest issue section
   */
  setPastLatestIssueSection(pastSection: boolean): void {
    this._pastLatestIssueSection.next(pastSection);
  }
}
