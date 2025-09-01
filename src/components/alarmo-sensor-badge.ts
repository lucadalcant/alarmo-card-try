import { LitElement, html, css, PropertyValues, TemplateResult, CSSResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { HassEntity } from 'home-assistant-js-websocket';
import { computeStateDisplay } from '../data/entity';
import { HomeAssistant, NumberFormat } from '../lib/types';
import { computeEntity } from '../lib/compute-entity';
import { fireEvent } from '../lib/fire-event';

class AlarmoSensorBadge extends LitElement {
  @property()
  public hass?: HomeAssistant;

  @property()
  public entity?: string;

  @property()
  public state?: string;

  shouldUpdate(changedProps: PropertyValues) {
    const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
    if (!oldHass) return true;
    if (this.entity && oldHass.states[this.entity] !== this.hass!.states[this.entity]) return true;
    return false;
  }

  protected render(): TemplateResult {
    if (!this.hass || !this.entity) return html``;
    const validEntity = this.entity in this.hass.states;
    let stateObj = { ...this.hass.states[this.entity] } as HassEntity;
    if (this.state !== undefined) stateObj = { ...stateObj, state: this.state };
    const value = validEntity
      ? computeStateDisplay(stateObj, this.hass.localize)
      : this.hass.localize(
          'state.default.unavailable',
          this.hass.locale || { language: this.hass.language, number_format: NumberFormat.language }
        );
    const name = validEntity ? stateObj.attributes.friendly_name || computeEntity(stateObj.entity_id) : this.entity;
    let binaryState = this.state ? true : stateObj.state == 'on';

    return html`
      <div class="badge-container" @click=${() => fireEvent(this, 'hass-more-info', { entityId: this.entity! })}>
        <div class="label-badge ${binaryState ? 'active' : ''}" id="badge">
          <div class="value">
            <ha-state-icon .hass=${this.hass} .stateObj=${stateObj}></ha-state-icon>
            <div class="label">
              <span>${value}</span>
            </div>
          </div>
        </div>
        <div class="title">${name}</div>
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .badge-container {
        display: inline-block;
        text-align: center;
        vertical-align: top;
        padding: var(--ha-label-badge-padding, 0 0 0 0);
        cursor: pointer;
      }
      .label-badge {
        position: relative;
        display: block;
        margin: 0 auto;
        width: var(--ha-label-badge-size, 2.5em);
        text-align: center;
        height: var(--ha-label-badge-size, 2.5em);
        line-height: var(--ha-label-badge-size, 2.5em);
        font-size: var(--ha-label-badge-font-size, 1.5em);
        border-radius: 50%;
        border: 0.1em solid var(--primary-color);
        color: var(--label-badge-text-color, rgb(76, 76, 76));
        white-space: nowrap;
        background-color: none;
        background-size: cover;
        transition: border 0.3s ease-in-out;
      }
      .label-badge.active {
        border: 0.1em solid var(--label-badge-red);
      }
      .label-badge .value {
        font-size: 90%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .label-badge .label {
        position: absolute;
        bottom: -1em;
        left: -0.2em;
        right: -0.2em;
        line-height: 1em;
        font-size: 0.5em;
      }
      .label-badge .label span {
        box-sizing: border-box;
        max-width: 100%;
        display: inline-block;
        background-color: var(--primary-color);
        color: var(--ha-label-badge-label-color, white);
        border-radius: 1em;
        padding: 9% 16% 8% 16%;
        font-weight: 500;
        overflow: hidden;
        text-transform: uppercase;
        text-overflow: ellipsis;
        transition: background-color 0.3s ease-in-out;
        text-transform: var(--ha-label-badge-label-text-transform, uppercase);
      }
      .label-badge.active .label span {
        background-color: var(--label-badge-red);
      }
      .badge-container .title {
        margin-top: 1em;
        font-size: var(--ha-label-badge-title-font-size, 0.9em);
        width: var(--ha-label-badge-title-width, 5em);
        font-weight: var(--ha-label-badge-title-font-weight, 400);
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: normal;
      }
    `;
  }
}

customElements.define('alarmo-sensor-badge', AlarmoSensorBadge);
