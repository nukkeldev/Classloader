export type Callback<T = void> = (t: T) => void;
export type Point = {
  time: number;
  callback: Callback;
};

export type CallbackCollection = {
  onStart?: Callback;
  onEnd?: Callback;
  atPoint?: Point[];
};

export class Animation {
  className: string;
  /**
   * Duration in seconds.
   */
  duration: number;
  removeOnFinish: boolean;

  callbacks?: CallbackCollection;

  constructor(
    className: string,
    duration: number,
    removeOnFinish: boolean,
    callbacks?: CallbackCollection
  ) {
    this.className = className;
    this.duration = duration;
    this.removeOnFinish = removeOnFinish;
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }
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

  newAnimation(
    className: string,
    duration: number,
    removeOnFinish: boolean,
    callbacks?: CallbackCollection
  ) {
    this.addAnimation(
      new Animation(className, duration, removeOnFinish, callbacks)
    );
  }

  newDelay(seconds: number) {
    this.newAnimation('', seconds, false);
  }

  addAnimation(animation: Animation) {
    animation.callbacks?.atPoint?.forEach(({time}) => {
      if (time >= animation.duration)
        throw new Error(
          'Specific point callbacks must fall within the duration of the animation.'
        );
    });

    this.animations.push(animation);
    this.totalDuration += animation.duration;
  }

  async execute() {
    for (let n = 0; n < this.animations.length; n++) {
      const animation = this.animations[n];
      if (animation.className != '')
        this.element.classList.add(animation.className);
      if (animation.callbacks?.onStart) animation.callbacks.onStart();

      let previousTime = 0;
      if (animation.callbacks?.atPoint)
        for (let i = 0; i < animation.callbacks.atPoint.length; i++) {
          let {time, callback} = animation.callbacks.atPoint[i];
          await delay(time - previousTime);
          previousTime = time;
          callback();
        }

      await delay(animation.duration - previousTime);

      if (animation.callbacks?.onEnd) animation.callbacks.onEnd();
      if (animation.removeOnFinish && animation.className != '')
        this.element.classList.remove(animation.className);
    }
  }
}

function delay(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// TEST

let notif = document.getElementById('notification')!;
let timeline = new Timeline('notification');

timeline.newDelay(1);
timeline.newAnimation('slideIn', 2 + 10, true);

notif.addEventListener('click', _ => {
  if (notif.classList.contains('slideIn')) notif.classList.remove('slideIn');
});

timeline.execute();
