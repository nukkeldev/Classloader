export type Callback<T = void> = (t: T) => void;
export type Point = {
  time: number;
  callback: Callback;
};

export interface Animation {
  className: string;
  /**
   * Duration in seconds.
   */
  duration: number;
  removeOnFinish: boolean;

  onStart?: Callback;
  onEnd?: Callback;
  atPoint?: Point[];
}

/**
 * A sequential handler of animations.
 */
export class Timeline {
  constructor(
    /**
     * The `id` of the element of which the classes will be modified.
     */
    elementId: string
  ) {
    const element = document.getElementById(elementId);
    if (!element)
      throw new Error(
        `Invalid element id. No element found with the id '${elementId}'`
      );
    this.element = element;
  }

  element: HTMLElement;
  animations: Animation[] = [];
  totalDuration: number = 0;

  addAnimation(animation: Animation) {
    animation.atPoint?.forEach(({time}) => {
      if (time >= animation.duration)
        throw new Error(
          'Specific point callbacks must fall within the duration of the animation.'
        );
    });

    this.animations.push(animation);
    this.totalDuration += animation.duration;
  }

  async execute() {
    console.log('Executing...');
    for (let n = 0; n < this.animations.length; n++) {
      const animation = this.animations[n];
      this.element.classList.add(animation.className);
      if (animation.onStart) animation.onStart();

      let previousTime = 0;
      if (animation.atPoint)
        for (let i = 0; i < animation.atPoint.length; i++) {
          let {time, callback} = animation.atPoint[i];
          await delay(time - previousTime);
          previousTime = time;
          callback();
        }

      await delay(animation.duration - previousTime);

      if (animation.onEnd) animation.onEnd();
      if (animation.removeOnFinish)
        this.element.classList.remove(animation.className);
    }
  }
}

function delay(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
