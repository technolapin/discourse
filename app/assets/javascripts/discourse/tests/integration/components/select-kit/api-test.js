import componentTest, {
  setupRenderingTest,
} from "discourse/tests/helpers/component-test";
import {
  discourseModule,
  queryAll,
} from "discourse/tests/helpers/qunit-helpers";
import selectKit, {
  DEFAULT_CONTENT,
  setDefaultState,
} from "discourse/tests/helpers/select-kit-helper";
import { clearCallbacks } from "select-kit/mixins/plugin-api";
import { withPluginApi } from "discourse/lib/plugin-api";

discourseModule("Integration | Component | select-kit:api", function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.setProperties({
      // subject: selectKit();
      comboBox: selectKit(".combo-box"),
      singleSelect: selectKit(".single-select:not(.combo-box)"),
    });
  });

  hooks.afterEach(function () {
    clearCallbacks();
  });

  componentTest("modifySelectKit(identifier).appendContent", {
    template: `
      {{combo-box value=value content=content onChange=onChange}}
      {{single-select value=value content=content onChange=onChange}}
    `,

    beforeEach() {
      setDefaultState(this, null, { content: DEFAULT_CONTENT });

      withPluginApi("0.8.43", (api) => {
        api.modifySelectKit("combo-box").appendContent(() => {
          return {
            id: "alpaca",
            name: "Alpaca",
          };
        });
        api.modifySelectKit("combo-box").appendContent(() => {});
      });
    },

    async test(assert) {
      await this.comboBox.expand();

      assert.equal(this.comboBox.rows().length, 4);

      const appendedRow = this.comboBox.rowByIndex(3);
      assert.ok(appendedRow.exists());
      assert.equal(appendedRow.value(), "alpaca");

      await this.comboBox.collapse();

      assert.notOk(this.singleSelect.rowByValue("alpaca").exists());
    },
  });

  componentTest("modifySelectKit(identifier).prependContent", {
    template: `
      {{combo-box value=value content=content onChange=onChange}}
      {{single-select value=value content=content onChange=onChange}}
    `,

    beforeEach() {
      setDefaultState(this, null, { content: DEFAULT_CONTENT });

      withPluginApi("0.8.43", (api) => {
        api.modifySelectKit("combo-box").prependContent(() => {
          return {
            id: "alpaca",
            name: "Alpaca",
          };
        });
        api.modifySelectKit("combo-box").prependContent(() => {});
      });
    },

    async test(assert) {
      await this.comboBox.expand();

      assert.equal(this.comboBox.rows().length, 4);

      const prependedRow = this.comboBox.rowByIndex(0);
      assert.ok(prependedRow.exists());
      assert.equal(prependedRow.value(), "alpaca");

      await this.comboBox.collapse();

      assert.notOk(this.singleSelect.rowByValue("alpaca").exists());
    },
  });

  componentTest("modifySelectKit(identifier).onChange", {
    template: `
      <div id="test"></div>
      {{combo-box value=value content=content onChange=onChange}}
    `,

    beforeEach() {
      setDefaultState(this, null, { content: DEFAULT_CONTENT });

      withPluginApi("0.8.43", (api) => {
        api.modifySelectKit("combo-box").onChange((component, value, item) => {
          queryAll("#test").text(item.name);
        });
      });
    },

    async test(assert) {
      await this.comboBox.expand();
      await this.comboBox.selectRowByIndex(0);

      assert.equal(queryAll("#test").text(), "foo");
    },
  });
});
