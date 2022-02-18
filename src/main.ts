import { LitElement, html, css, PropertyValueMap } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import '@material/mwc-snackbar'
import '@material/mwc-button'
import './notification-manager'
import '@material/mwc-slider'
import '@material/mwc-select'
import { Select } from '@material/mwc-select'
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

  @state()
  private set = 'default'

  @state()
  private sets = {
      default: ['YOU CAN DO IT!', 'YES!', "LET'S GOOOOOO", 'GO FOR IT!', "THAT'S IT!", "IT'S EASY", 'YEEEEESSSSS', 'BOOOOM!', '😊', 'Steady but Surely', '👍', "You're a Winner!", 'Slow Down.', 'Slow down and think', 'Think.', 'Breathe', 'Deep breathe', 'Take it easy', 'Drink', 'You are great!', 'Focus on your goals']
  }

  @state()
  private everyMinute = 10

  @state()
  private running: boolean = false;

  @query('textarea') textarea!: HTMLTextAreaElement;
  @query('mwc-select') select!: Select;

  static styles = css`
  :host {
    display: block;
    padding: 58px;
  }
  `

  constructor () {
    super()
    const data = localStorage.getItem('push-motivations:data')
    if (data) {
      this.sets = JSON.parse(data)
    }
  }

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
    <mwc-button unelevated
      ?disabled=${this.sets[this.set].length === 0}
      @click=${() => { this.toggleRunning() }}>${this.running ? 'stop' : 'start'}</mwc-button>


    <!-- Set selection -->
    <div style="display:flex;align-items:center;margin-top:24px">
    <mwc-select
      @selected=${(e) => { this.set = Object.keys(this.sets)[e.detail.index]; this.checkIntegrity() }}
    >
      ${Object.keys(this.sets).map(set => html`<mwc-list-item value=${set}>${set}</mwc-list-item>`)}
    </mwc-select>
    <mwc-button outlined icon=add
      @click=${() => { this.onNewSetButtonClick() }}>create new set</mwc-button>
    </div>

    <textarea style="width:100%;resize:vertical;min-height:300px"
      .value="${this.sets[this.set].join('\n')}"
      @keyup=${() => { this.onTextAreaKeyup() }}></textarea>
    `
  }

  private onNewSetButtonClick() {
    const pr = prompt('set name')
    if (pr === undefined || pr === null || pr === '') {
     return
    }
    if (Object.keys(this.sets).includes(pr)) {
      window.toast('this name already exists')
      return
    }
    this.sets[pr] = []
    this.set = pr
    if (this.running)
      this.toggleRunning()
  }

  checkIntegrity () {
    console.log(this.sets, this.set)
    if (this.sets[this.set].length === 0 && this.running) {
      this.toggleRunning()
    }
  }

  onTextAreaKeyup () {
    this.sets[this.set] = this.textarea.value.split('\n')
    if (this.sets[this.set].length === 1 && this.sets[this.set][0] === '') {
      this.sets[this.set] = []
    }
    this.checkIntegrity()
    this.requestUpdate()
    this.save()
  }

  toggleRunning () {
    this.running = !this.running;
    this.clearLoop()
    if (this.running) {
      this.sendMotivation()
      // Start the loop
      this._loopInterval = setInterval(() => {
        this.sendMotivation()
      }, this.everyMinute * 60 * 1000)
    }
  }

  private _loopInterval?: NodeJS.Timeout;
  private clearLoop () {
    if (this._loopInterval) {
      clearInterval(this._loopInterval)
      this._loopInterval = undefined
    }
  }
  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.select.value = this.set
  }

  sendMotivation () {
    window.notificationService.checkPermission().then(granted => {
      if (granted) {
        window.notificationService.notify(this.getRandomQuote())
      }
    })
  }

  getRandomQuote () {
    return this.sets[this.set][Math.floor(Math.random() * this.sets[this.set].length)]
  }

  private save() {
    localStorage.setItem('push-motivations:data', JSON.stringify(this.sets))
  }
}
