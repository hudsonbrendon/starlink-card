import { css } from 'lit';

export const styles = css`
  :host {
    --starlink-online-color: #2f6bff;
    --starlink-stage-bg: var(--starlink-stage-background, #f5f6f8);
  }

  ha-card {
    overflow: hidden;
    padding: 0;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 18px 6px;
  }
  .name {
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--primary-text-color);
  }
  .status {
    font-size: 0.92rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .status .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }

  .stage {
    position: relative;
    height: 156px;
    margin: 2px 0;
    background: var(--starlink-stage-bg);
    overflow: hidden;
  }
  .dish {
    position: absolute;
    inset: 0;
    background-repeat: no-repeat;
    background-size: 96% auto;
    background-position: center 56%;
    transition:
      filter 0.4s ease,
      opacity 0.4s ease;
  }
  .stage.is-none .dish,
  .stage.is-offline .dish {
    filter: grayscale(0.85) brightness(1.02);
    opacity: 0.5;
  }

  .overlay {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  /* signal waves */
  .wave {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    transform-box: fill-box;
    transform-origin: center;
    opacity: 0;
    animation: wave 2.4s infinite;
  }
  .wave.w2 {
    animation-delay: 0.5s;
  }
  .wave.w3 {
    animation-delay: 1s;
  }
  @keyframes wave {
    0% {
      opacity: 0;
      transform: scale(0.5);
    }
    30% {
      opacity: 0.95;
    }
    100% {
      opacity: 0;
      transform: scale(1.25);
    }
  }

  /* snow (heating / melting) */
  .snow {
    fill: #cfe3ff;
    opacity: 0;
    animation: snow 2.6s linear infinite;
  }
  @keyframes snow {
    0% {
      opacity: 0;
      transform: translateY(-6px);
    }
    20% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
      transform: translateY(34px);
    }
  }

  /* heat shimmer */
  .heat {
    animation: heat 1.6s ease-in-out infinite;
  }
  @keyframes heat {
    0%,
    100% {
      opacity: 0.25;
    }
    50% {
      opacity: 0.7;
    }
  }

  .footer {
    display: flex;
    justify-content: space-around;
    padding: 12px 12px 16px;
    border-top: 1px solid var(--divider-color, #ededed);
  }
  .stat {
    text-align: center;
    flex: 1;
  }
  .stat .v {
    font-size: 1rem;
    font-weight: 650;
    color: var(--primary-text-color);
  }
  .stat .v .u {
    font-size: 0.66em;
    font-weight: 500;
    color: var(--secondary-text-color);
  }
  .stat.dl .v {
    color: var(--starlink-online-color);
  }
  .stat .l {
    font-size: 0.66rem;
    color: var(--secondary-text-color);
    margin-top: 2px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
  .stat.muted .v {
    color: var(--disabled-text-color, #bdbdbd);
  }

  .buttons {
    display: flex;
    gap: 8px;
    padding: 0 12px 14px;
  }
  .buttons ha-icon-button {
    --mdc-icon-button-size: 40px;
    color: var(--secondary-text-color);
  }

  .clickable {
    cursor: pointer;
  }
`;
