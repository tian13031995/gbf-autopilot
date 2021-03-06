import forEach from "lodash/forEach";

export default {
  "battle.count": function(arg, done) {
    const el = document.querySelector(".prt-battle-num > .txt-info-num > div:first-child");
    if (el && el.className.indexOf("num-info") >= 0) {
      done(Number(el.className.substr(-1)));
    } else {
      done(1);
    }
  },
  "battle.state": function(arg, done, fail) {
    const els = document.querySelectorAll(".prt-command-chara[pos]");
    if (els.length <= 0) {
      fail(new Error("Skill elements not found!"));
    }

    const summonEls = document.querySelectorAll(".lis-summon");
    if (summonEls.length <= 0) {
      fail(new Error("Summon elements not found!"));
    }

    const state = {
      party: {},
      summons: {}
    };

    const handleSkill = (root, el) => {
      const id = Number(el.getAttribute("ability-id"));
      if (!id) return;

      const matches = el.className.match(/-(\d)-(\d)$/);
      const chara = Number(matches[1]);
      const skill = Number(matches[2]);
      const charaState = state.party[chara] || {};
      
      const div = document.createElement("div");
      div.innerHTML = el.getAttribute("text-data");
      const description = div.textContent || div.innerText || "";

      const cooldown = {
        current: Number(el.getAttribute("ability-recast")),
        max: Number(el.getAttribute("recaset-default"))
      };
      const effect = {
        second: Number(el.getAttribute("duration-second")),
        turn: Number(el.getAttribute("duration"))
      };
      const skillState = {
        num: skill,
        id,
        type: el.getAttribute("type").split(",").map((type) => type.trim()),
        name: el.getAttribute("ability-name"),
        description, cooldown, effect,
        available: root.className.indexOf("ability-disable") == -1 && cooldown.current == 0,
      };

      charaState[skill] = skillState;
      state.party[chara] = charaState;
    };

    forEach(els, (root) => {
      forEach(root.querySelectorAll(".lis-ability > div:first-child"), (el) => {
        handleSkill(root, el);
      });
    });

    forEach(summonEls, (el) => {
      const pos = Number(el.getAttribute("pos"));
      const call = {
        name: el.getAttribute("summon-skill-name"),
        effect: el.getAttribute("summon-comment")
      };
      const aura = {
        name: el.getAttribute("summon-protection-name"),
        effect: el.getAttribute("summon-protection")
      };
      const cooldown = {
        current: Number(el.getAttribute("summon-recast")),
        max: Number(el.getAttribute("summon-require"))
      };
      const summonState = {
        pos,
        code: Number(el.getAttribute("summon-code")),
        name: el.getAttribute("summon-name"),
        attribute: Number(el.getAttribute("summon-attribute")),
        available: cooldown.current <= 0,
        call, aura, cooldown
      };

      state.summons[pos] = summonState;
    });

    done(state);
  }
};
