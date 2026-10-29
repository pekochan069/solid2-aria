import { expect, test, afterEach } from "bun:test";

import { CalendarDate, Time } from "@internationalized/date";
import { requireValue } from "@solid2-aria/core/utils/require-value";
import { render } from "@solidjs/web";
import type { JSX } from "@solidjs/web";
import { untrack, createSignal, flush, For } from "solid-js";

import { Button } from "../src/button";
import {
  Calendar,
  RangeCalendar,
  CalendarGrid,
  CalendarCell,
  CalendarHeading,
  CalendarMonthPicker,
  CalendarYearPicker,
} from "../src/calendar";
import { ColorArea } from "../src/color-area";
import { ColorField } from "../src/color-field";
import { ColorPicker } from "../src/color-picker";
import { ColorSlider } from "../src/color-slider";
import { ColorSwatch } from "../src/color-swatch";
import {
  ColorSwatchPicker,
  ColorSwatchPickerItem,
} from "../src/color-swatch-picker";
import { ColorThumb } from "../src/color-thumb";
import { ColorWheel, ColorWheelTrack } from "../src/color-wheel";
import {
  DateField,
  TimeField,
  DateInput,
  DateSegment,
} from "../src/date-field";
import { DatePicker, DateRangePicker } from "../src/date-picker";
import { Dialog } from "../src/dialog";
import { Group } from "../src/group";
import { Input } from "../src/input";
import { Label } from "../src/label";
import { NumberField } from "../src/number-field";
import { Popover } from "../src/popover";
import {
  Slider,
  SliderTrack,
  SliderThumb,
  SliderOutput,
  SliderFill,
} from "../src/slider";

const mounted = new Set<() => void>();

afterEach(() => {
  for (const dispose of mounted) {
    dispose();
  }
});

function mount(view: () => JSX.Element) {
  const host = document.createElement("div");
  document.body.append(host);
  const dispose = render(view, host);
  flush();

  const cleanup = () => {
    mounted.delete(cleanup);
    dispose();
    host.remove();
    flush();
  };

  mounted.add(cleanup);

  return { dispose: cleanup, host };
}

function change(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  flush();
}

test("number field composes steppers and localized input with form submission", () => {
  const app = mount(() => (
    <NumberField defaultValue={3} minValue={0} maxValue={4} name="quantity">
      <Label>Quantity</Label>
      <Group>
        <Button slot="decrement">Less</Button>
        <Input />
        <Button slot="increment">More</Button>
      </Group>
    </NumberField>
  ));

  const input = requireValue(
    app.host.querySelector<HTMLInputElement>("input:not([type=hidden])"),
    "Expected required element or component context"
  );

  const buttons = app.host.querySelectorAll("button");
  expect(input.value).toBe("3");
  requireValue(
    buttons[1],
    "Expected required element or component context"
  ).click();
  flush();
  expect(input.value).toBe("4");
  expect(
    requireValue(buttons[1], "Expected required element or component context")
      .disabled
  ).toBe(true);
  requireValue(
    buttons[0],
    "Expected required element or component context"
  ).click();
  flush();
  expect(input.value).toBe("3");
  expect(
    requireValue(
      app.host.querySelector<HTMLInputElement>('input[type="hidden"]'),
      "Expected required element or component context"
    ).value
  ).toBe("3");
  app.dispose();
});

test("slider output, input and fill react to native input and controlled changes", () => {
  const [value, setValue] = createSignal(20);

  const app = mount(() => (
    <Slider
      value={value()}
      onChange={(next) => {
        setValue(next);
      }}
      aria-label="Volume"
    >
      <SliderOutput />
      <SliderTrack>
        <SliderFill />
        <SliderThumb name="volume" />
      </SliderTrack>
    </Slider>
  ));

  const input = requireValue(
    app.host.querySelector("input"),
    "Expected required element or component context"
  );

  expect(input.value).toBe("20");
  expect(
    requireValue(
      app.host.querySelector("output"),
      "Expected required element or component context"
    ).textContent
  ).toBe("20");
  change(input, "40");
  expect(untrack(() => value())).toBe(40);
  expect(
    requireValue(
      app.host.querySelector("output"),
      "Expected required element or component context"
    ).textContent
  ).toBe("40");
  setValue(70);
  flush();
  expect(input.value).toBe("70");
  expect(
    requireValue(
      app.host.querySelector<HTMLElement>(".solid2-aria-SliderFill"),
      "Expected required element or component context"
    ).style.width
  ).toBe("70%");
  app.dispose();
});

test("calendar pages, localized heading and selected dates stay connected", () => {
  const selected: string[] = [];

  const app = mount(() => (
    <Calendar
      aria-label="Choose date"
      defaultValue={new CalendarDate(2026, 10, 5)}
      onChange={(date) => {
        selected.push(date.toString());
      }}
    >
      <CalendarHeading />
      <Button slot="next">Next</Button>
      <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
    </Calendar>
  ));

  expect(
    requireValue(
      app.host.querySelector(".solid2-aria-CalendarHeading"),
      "Expected required element or component context"
    ).textContent
  ).toContain("2026");
  expect(
    requireValue(
      app.host.querySelector("[data-selected]"),
      "Expected required element or component context"
    ).textContent
  ).toBe("5");

  const cell =
    app.host.querySelector<HTMLElement>(
      '[data-rac][role="button"][aria-label*="October 8"]'
    ) ??
    requireValue(
      [...app.host.querySelectorAll<HTMLElement>('[role="button"]')].find(
        (el) =>
          el.textContent === "8" && !Object.hasOwn(el.dataset, "outsideMonth")
      ),
      "Expected required element or component context"
    );

  cell.click();
  flush();
  expect(selected.at(-1)).toBe("2026-10-08");
  requireValue(
    app.host.querySelector("button"),
    "Expected required element or component context"
  ).click();
  flush();
  expect(
    requireValue(
      app.host.querySelector(".solid2-aria-CalendarHeading"),
      "Expected required element or component context"
    ).textContent
  ).toContain("November");
  app.dispose();
});

test("date and time segments preserve their DOM while keyboard editing", () => {
  const app = mount(() => (
    <>
      <DateField defaultValue={new CalendarDate(2026, 10, 5)} name="date">
        <Label>Date</Label>
        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      </DateField>
      <TimeField defaultValue={new Time(10, 30)} name="time">
        <Label>Time</Label>
        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      </TimeField>
    </>
  ));

  const month = requireValue(
    app.host.querySelector<HTMLElement>('[data-type="month"]'),
    "Expected required element or component context"
  );

  month.focus();
  month.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "ArrowUp" })
  );
  flush();
  expect(month.textContent).toBe("11");
  expect(app.host.querySelector('[data-type="month"]')).toBe(month);
  expect(
    requireValue(
      app.host.querySelector<HTMLInputElement>('input[name="date"][form=""]'),
      "Expected required element or component context"
    ).value
  ).toBe("2026-11-05");

  const minute = requireValue(
    app.host.querySelector<HTMLElement>('[data-type="minute"]'),
    "Expected required element or component context"
  );

  minute.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "ArrowUp" })
  );
  flush();
  expect(minute.textContent).toBe("31");
  expect(
    app.host.querySelector<HTMLInputElement>('input[name="time"]')?.value
  ).toBe("10:31:00");
  app.dispose();
});

test("native hidden date input accepts autofill changes", () => {
  const app = mount(() => (
    <DateField aria-label="Date" name="date">
      <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
    </DateField>
  ));

  const input = requireValue(
    app.host.querySelector<HTMLInputElement>('input[type="date"]'),
    "Expected required element or component context"
  );

  change(input, "2027-02-03");
  expect(
    requireValue(
      app.host.querySelector('[data-type="year"]'),
      "Expected required element or component context"
    ).textContent
  ).toBe("2027");
  expect(
    requireValue(
      app.host.querySelector('[data-type="day"]'),
      "Expected required element or component context"
    ).textContent
  ).toBe("3");
  app.dispose();
});

test("date picker opens a calendar popover and commits the selected date", () => {
  const app = mount(() => (
    <DatePicker
      aria-label="Appointment"
      defaultValue={new CalendarDate(2026, 10, 5)}
    >
      <Group>
        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
        <Button>Open</Button>
      </Group>
      <Popover>
        <Dialog>
          <Calendar>
            <CalendarGrid>
              {(date) => <CalendarCell date={date} />}
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </DatePicker>
  ));

  requireValue(
    app.host.querySelector("button"),
    "Expected required element or component context"
  ).click();
  flush();
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();

  const cell = requireValue(
    [...document.querySelectorAll<HTMLElement>('[role="button"]')].find(
      (el) =>
        el.textContent === "12" && !Object.hasOwn(el.dataset, "outsideMonth")
    ),
    "Expected required element or component context"
  );

  cell.click();
  flush();
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(
    requireValue(
      app.host.querySelector('[data-type="day"]'),
      "Expected required element or component context"
    ).textContent
  ).toBe("12");
  app.dispose();
});

test("color picker synchronizes channel inputs, swatches, gradients and render props", () => {
  const app = mount(() => (
    <ColorPicker defaultValue="#ff0000">
      <ColorField aria-label="Hex">
        <Input />
      </ColorField>
      <ColorSwatch />
      <ColorSlider channel="red">
        <SliderTrack>
          <ColorThumb />
        </SliderTrack>
        <SliderOutput />
      </ColorSlider>
      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness">
        <ColorThumb />
      </ColorArea>
      <ColorWheel outerRadius={100} innerRadius={80}>
        <ColorWheelTrack />
        <ColorThumb />
      </ColorWheel>
    </ColorPicker>
  ));

  const input = requireValue(
    app.host.querySelector<HTMLInputElement>('input[type="text"]'),
    "Expected required element or component context"
  );

  expect(input.value.toLowerCase()).toBe("#ff0000");

  const red = requireValue(
    app.host.querySelector<HTMLInputElement>('input[type="range"]'),
    "Expected required element or component context"
  );

  change(red, "128");
  expect(input.value.toLowerCase()).toBe("#800000");
  expect(
    requireValue(
      app.host.querySelector<HTMLElement>(".solid2-aria-ColorSwatch"),
      "Expected required element or component context"
    ).style.backgroundColor
  ).toContain("128, 0, 0");
  expect(
    app.host.querySelectorAll<HTMLInputElement>('input[type="range"]').length
  ).toBe(4);
  expect(
    requireValue(
      app.host.querySelector<HTMLElement>(".solid2-aria-ColorArea"),
      "Expected required element or component context"
    ).style.position
  ).toBe("relative");
  app.dispose();
});

test("color channel fields edit individual channels", () => {
  const app = mount(() => (
    <ColorField channel="red" defaultValue="#ff0000">
      <Label>Red</Label>
      <Input />
    </ColorField>
  ));

  const input = requireValue(
    app.host.querySelector("input"),
    "Expected required element or component context"
  );

  expect(input.value).toBe("255");
  change(input, "128");
  input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  flush();
  expect(input.value).toBe("128");
  app.dispose();
});

test("color swatch picker selects a composed color option", () => {
  let value = "";

  const app = mount(() => (
    <ColorSwatchPicker
      defaultValue="#ff0000"
      onChange={(color) => {
        value = color.toString("hex");
      }}
    >
      <ColorSwatchPickerItem color="#ff0000">
        <ColorSwatch />
      </ColorSwatchPickerItem>
      <ColorSwatchPickerItem color="#00ff00">
        <ColorSwatch />
      </ColorSwatchPickerItem>
    </ColorSwatchPicker>
  ));

  const options = app.host.querySelectorAll<HTMLElement>('[role="option"]');
  expect(options.length).toBe(2);
  expect(
    requireValue(
      options[0],
      "Expected required element or component context"
    ).getAttribute("aria-selected")
  ).toBe("true");
  requireValue(
    options[1],
    "Expected required element or component context"
  ).click();
  flush();
  expect(value.toLowerCase()).toBe("#00ff00");
  expect(
    requireValue(
      options[1],
      "Expected required element or component context"
    ).getAttribute("aria-selected")
  ).toBe("true");
  app.dispose();
});

test("range calendar marks both endpoints and commits a new range", () => {
  let value = "";

  const app = mount(() => (
    <RangeCalendar
      aria-label="Trip"
      defaultValue={{
        end: new CalendarDate(2026, 10, 8),
        start: new CalendarDate(2026, 10, 5),
      }}
      onChange={(range) => {
        value = `${range.start.toString()}/${range.end.toString()}`;
      }}
    >
      <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
    </RangeCalendar>
  ));

  expect(
    requireValue(
      app.host.querySelector("[data-selection-start]"),
      "Expected required element or component context"
    ).textContent
  ).toBe("5");
  expect(
    requireValue(
      app.host.querySelector("[data-selection-end]"),
      "Expected required element or component context"
    ).textContent
  ).toBe("8");

  const cells = () =>
    [...app.host.querySelectorAll<HTMLElement>('[role="button"]')].filter(
      (cell) => !Object.hasOwn(cell.dataset, "outsideMonth")
    );

  requireValue(
    cells().find((cell) => cell.textContent === "12"),
    "Expected required element or component context"
  ).click();
  flush();
  requireValue(
    cells().find((cell) => cell.textContent === "15"),
    "Expected required element or component context"
  ).click();
  flush();
  expect(value).toBe("2026-10-12/2026-10-15");
  app.dispose();
});

test("date range picker connects start and end slots to independent segments", () => {
  const app = mount(() => (
    <DateRangePicker
      aria-label="Trip"
      defaultValue={{
        end: new CalendarDate(2026, 10, 8),
        start: new CalendarDate(2026, 10, 5),
      }}
    >
      <Group>
        <DateInput slot="start">
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <DateInput slot="end">
          {(segment) => <DateSegment segment={segment} />}
        </DateInput>
        <Button>Open calendar</Button>
      </Group>
    </DateRangePicker>
  ));

  const dates = app.host.querySelectorAll<HTMLElement>('[data-type="day"]');
  expect(
    requireValue(dates[0], "Expected required element or component context")
      .textContent
  ).toBe("5");
  expect(
    requireValue(dates[1], "Expected required element or component context")
      .textContent
  ).toBe("8");
  requireValue(
    dates[0],
    "Expected required element or component context"
  ).dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "ArrowUp" })
  );
  flush();
  expect(
    requireValue(dates[0], "Expected required element or component context")
      .textContent
  ).toBe("6");
  expect(
    requireValue(dates[1], "Expected required element or component context")
      .textContent
  ).toBe("8");
  app.dispose();
});

test("color area edits both axes and color wheel changes hue", () => {
  const app = mount(() => (
    <>
      <ColorArea
        aria-label="Color"
        defaultValue="hsb(0, 100%, 100%)"
        colorSpace="hsb"
        xChannel="saturation"
        yChannel="brightness"
      >
        {(v) => (
          <>
            <output data-area="">{v.state.value.toString("hex")}</output>
            <ColorThumb />
          </>
        )}
      </ColorArea>
      <ColorWheel
        aria-label="Hue"
        defaultValue="hsl(0, 100%, 50%)"
        outerRadius={100}
        innerRadius={80}
      >
        {(v) => (
          <>
            <output data-wheel="">{v.state.value.toString("hex")}</output>
            <ColorWheelTrack />
            <ColorThumb />
          </>
        )}
      </ColorWheel>
    </>
  ));

  const inputs = app.host.querySelectorAll<HTMLInputElement>(
    'input[type="range"]'
  );

  change(requireValue(inputs[0], "Expected color channel input"), "0");
  expect(
    requireValue(
      app.host.querySelector("[data-area]"),
      "Expected required element or component context"
    ).textContent?.toLowerCase()
  ).toBe("#ffffff");
  change(requireValue(inputs[1], "Expected color channel input"), "50");
  expect(
    requireValue(
      app.host.querySelector("[data-area]"),
      "Expected required element or component context"
    ).textContent?.toLowerCase()
  ).toBe("#808080");
  change(requireValue(inputs[2], "Expected color channel input"), "120");
  expect(
    requireValue(
      app.host.querySelector("[data-wheel]"),
      "Expected required element or component context"
    ).textContent?.toLowerCase()
  ).toBe("#00ff00");
  app.dispose();
});

test("calendar month and year picker render APIs update the visible month", () => {
  const app = mount(() => (
    <Calendar aria-label="Date" defaultValue={new CalendarDate(2026, 10, 5)}>
      <CalendarHeading />
      <CalendarMonthPicker>
        {(aria) => (
          <select
            aria-label={aria["aria-label"]}
            value={aria.value}
            onChange={(event) => {
              aria.onChange(event.currentTarget.value);
            }}
          >
            <For each={aria.items}>
              {(item) => <option value={item.id}>{item.formatted}</option>}
            </For>
          </select>
        )}
      </CalendarMonthPicker>
      <CalendarYearPicker>
        {(aria) => (
          <select
            aria-label={aria["aria-label"]}
            value={aria.value}
            onChange={(event) => {
              aria.onChange(event.currentTarget.value);
            }}
          >
            <For each={aria.items}>
              {(item) => <option value={item.id}>{item.formatted}</option>}
            </For>
          </select>
        )}
      </CalendarYearPicker>
    </Calendar>
  ));

  const selects = app.host.querySelectorAll("select");
  requireValue(
    selects[0],
    "Expected required element or component context"
  ).value = "11";
  requireValue(
    selects[0],
    "Expected required element or component context"
  ).dispatchEvent(new Event("change", { bubbles: true }));
  flush();
  expect(
    requireValue(
      app.host.querySelector(".solid2-aria-CalendarHeading"),
      "Expected required element or component context"
    ).textContent
  ).toContain("November");

  const yearOption = requireValue(
    [...requireValue(selects[1], "Expected year picker").options].find(
      (option) => option.textContent === "2027"
    ),
    "Expected year option"
  );

  requireValue(
    selects[1],
    "Expected required element or component context"
  ).value = yearOption.value;
  requireValue(
    selects[1],
    "Expected required element or component context"
  ).dispatchEvent(new Event("change", { bubbles: true }));
  flush();
  expect(
    requireValue(
      app.host.querySelector(".solid2-aria-CalendarHeading"),
      "Expected required element or component context"
    ).textContent
  ).toContain("2027");
  app.dispose();
});

test("color area gradients and thumb positions follow controlled colors", () => {
  const [color, setColor] = createSignal("hsl(0, 100%, 50%)");

  const app = mount(() => (
    <ColorArea
      aria-label="Color"
      colorSpace="hsl"
      xChannel="saturation"
      yChannel="lightness"
      value={color()}
    >
      <ColorThumb />
    </ColorArea>
  ));

  const area = requireValue(
    app.host.querySelector<HTMLElement>(".solid2-aria-ColorArea"),
    "Expected color area"
  );

  const thumb = requireValue(
    app.host.querySelector<HTMLElement>(".solid2-aria-ColorThumb"),
    "Expected color thumb"
  );

  const initialBackground = area.style.background;
  expect(thumb.style.left).toBe("100%");
  setColor("hsl(120, 50%, 25%)");
  flush();
  expect(area.style.background).not.toBe(initialBackground);
  expect(thumb.style.left).toBe("50%");
  expect(thumb.style.top).toBe("75%");
  app.dispose();
});

test("range calendar resets an unfinished selection when focus leaves", () => {
  let value = "";

  const app = mount(() => (
    <RangeCalendar
      aria-label="Trip"
      commitBehavior="reset"
      defaultValue={{
        end: new CalendarDate(2026, 10, 8),
        start: new CalendarDate(2026, 10, 5),
      }}
      onChange={(range) => {
        value = `${range.start.toString()}/${range.end.toString()}`;
      }}
    >
      <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
    </RangeCalendar>
  ));

  const outside = document.createElement("button");
  document.body.append(outside);

  const cell = (day: string) =>
    requireValue(
      [...app.host.querySelectorAll<HTMLElement>('[role="button"]')].find(
        (element) =>
          element.textContent === day &&
          !Object.hasOwn(element.dataset, "outsideMonth")
      ),
      "Expected calendar cell"
    );

  cell("12").focus();
  cell("12").click();
  flush();
  outside.focus();
  flush();
  cell("15").click();
  flush();
  expect(value).toBe("");
  cell("18").click();
  flush();
  expect(value).toBe("2026-10-15/2026-10-18");
  outside.remove();
  app.dispose();
});
