import { LitElement, html, css, PropertyValueMap } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '@material/mwc-snackbar'
import '@material/mwc-button'
import './notification-manager'
import '@material/mwc-slider'
// import '@material/mwc-icon-button'
// import '@material/mwc-dialog'
// import '@material/mwc-textfield'
// import '@material/mwc-checkbox'

declare global {
  interface Window {
    app: AppContainer;
    toast: (labelText: string, timeoutMs?: number) => void;
  }
}

@customElement('app-container')
export class AppContainer extends LitElement {

  private quotes = ['YOU CAN DO IT!', 'YES!', "LET'S GOOOOOO", 'GO FOR IT!', "THAT'S IT!", "IT'S EASY", 'YEEEEESSSSS', 'BOOOOM!', '😊', 'Steady but Surely', '👍', "You're a Winner!"]

  @state()
  private everyMinute = 10

  @state()
  private running?: boolean;

  static styles = css`
  :host {
    display: block;
    padding: 58px;
  }
  `

  render () {
    return html`
    <p>Show a motivational quote (as a notification) every ${this.everyMinute} minutes</p>
    <mwc-slider
      style="margin:32px 0"
      discrete
      withTickMarks
      min=1
      max=60
      value=${this.everyMinute}
      @change=${(e) => { this.everyMinute = e.detail.value }}
    ></mwc-slider>
    <mwc-button outlined
      @click=${() => { this.toggleRunning() }}>${this.running ? 'stop' : 'start'}</mwc-button>
    `
  }

  toggleRunning () {
    if (this.running === undefined) {
      this.sendMotivation()
    }
    this.running = !this.running;
  }

  private _loopInterval?: NodeJS.Timeout;
  private clearLoop () {
    if (this._loopInterval) {
      clearInterval(this._loopInterval)
      this._loopInterval = undefined
    }
  }
  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.clearLoop()
    this._loopInterval = setInterval(() => {
      this.sendMotivation()
    }, this.everyMinute * 60 * 1000)
  }

  sendMotivation () {
    window.notificationService.checkPermission().then(granted => {
      if (granted) {
        window.notificationService.notify(this.getRandomQuote())
      }
    })
  }

  getRandomQuote () {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)]
  }
}
