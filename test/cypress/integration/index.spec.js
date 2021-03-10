/// <reference types="cypress" />

context("Default", () => {
  beforeEach(() => {
    cy.visit("http://localhost:5000/");
  });

  it("visit Main by default + isActive works", () => {
    cy.get("#target #text").should("contain.text", "I'm main");

    cy.get("#isActive").should("have.css", "color").and("eq", "rgb(255, 0, 0)");
  });

  it("url input + not found + use:link works", () => {
    cy.get("input#url-input").type("/404{enter}");

    cy.location("pathname").should("eq", "/404");

    cy.get("#target #text").should("contain.text", "NotFound");

    cy.get(".result a").first().click();

    cy.get("#target #text").should("contain.text", "I'm main");
  });

  it("navigation works", () => {
    cy.get("input#url-input").type("/404{enter}");
    cy.go(-1);
    cy.get("#target #text").should("contain.text", "I'm main");
  });

  it("params works", () => {
    // /foo/:param
    cy.get("input#url-input").type("/foo/something/{enter}");

    cy.get("#target #text").should("contain.text", "I'm params");
    cy.get("#target #data").should(
      "contain.text",
      JSON.stringify({ param: "something" })
    );
  });

  it("params works - complex", () => {
    // /foo/:pr1/bar/:pr2/bla/:pr3
    cy.get("input#url-input").type("/foo/hello/bar/world/bla/hi{enter}");

    cy.get("#target #text").should("contain.text", "I'm params");
    cy.get("#target #data").should(
      "contain.text",
      JSON.stringify({ pr1: "hello", pr2: "world", pr3: "hi" })
    );
  });

  it("lazy works", () => {
    // /lazy
    cy.get("input#url-input").type("/lazy/{enter}");

    cy.get("#target #text").should("contain.text", "Loading...");
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "I'm Lazy");
  });

  it("metadata - defaultLoading works", () => {
    // /lazy-default
    cy.get("input#url-input").type("/lazy-default{enter}");

    cy.get("#target #text").should("contain.text", "Loading... (2)");
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "I'm Lazy");
  });

  it("lazy with params works", () => {
    // /lazy-pr/:param
    cy.get("input#url-input").type("/lazy-pr/hello{enter}");

    cy.get("#target #text").should("contain.text", "Loading...");
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "I'm Lazy");
    cy.get("#target #data").should(
      "contain.text",
      JSON.stringify({ param: "hello" })
    );
  });

  it("lazy fail works", () => {
    // /lazy-fail
    cy.get("input#url-input").type("/lazy-fail{enter}");

    cy.get("#target #text").should("contain.text", "Loading...");
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "Error");
    cy.get("#target #data").should("contain.text", "a fail");
  });

  it("authentication fails after waiting for 1s", () => {
    // /protected-wait-false
    cy.get("input#url-input").type("/protected-wait-false{enter}");

    cy.get("#target #text").should(
      "contain.text",
      "Checking if you authenticated"
    );
    cy.wait(1000);
    cy.get("#target #text").should(
      "contain.text",
      "Sorry, you are NOT authenticated"
    );
  });

  it("authentication fails immediately", () => {
    // /protected-false
    cy.get("input#url-input").type("/protected-false{enter}");

    cy.get("#target #text").should(
      "contain.text",
      "Sorry, you are NOT authenticated"
    );
  });

  it("authentication passes after waiting for 1s", () => {
    // /protected-wait-true/:param
    cy.get("input#url-input").type("/protected-wait-true/something/{enter}");

    cy.get("#target #text").should(
      "contain.text",
      "Checking if you authenticated"
    );
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "I'm protected");
    cy.get("#target #data").should(
      "contain.text",
      JSON.stringify({ param: "something" })
    );
  });

  it("authentication passes immediately", () => {
    // /protected-true/:param
    cy.get("input#url-input").type("/protected-true/something{enter}");

    cy.get("#target #text").should("contain.text", "I'm protected");
    cy.get("#target #data").should(
      "contain.text",
      JSON.stringify({ param: "something" })
    );
  });

  it("inline - works", () => {
    // /inline
    cy.get("input#url-input").type("/inline{enter}");

    cy.get("#target #text").should("contain.text", "Inline Params");
  });

  it("inline - params works", () => {
    // /inline-pr/:params
    cy.get("input#url-input").type("/inline-pr/something{enter}");

    cy.get("#target #text").should("contain.text", "Inline Params");
    cy.get("#target #data").should(
      "contain.text",
      JSON.stringify({ param: "something" })
    );
  });

  it("inline - authentication fails after waiting for 1s", () => {
    // /inline-protected-wait-false
    cy.get("input#url-input").type("/inline-protected-wait-false{enter}");

    cy.get("#target #text").should(
      "contain.text",
      "Checking if you authenticated"
    );
    cy.wait(1000);
    cy.get("#target #text").should(
      "contain.text",
      "Sorry, you are NOT authenticated"
    );
  });

  it("inline - authentication passes after waiting for 1s", () => {
    // /inline-protected-wait-true/:param
    cy.get("input#url-input").type(
      "/inline-protected-wait-true/something{enter}"
    );

    cy.get("#target #text").should(
      "contain.text",
      "Inline Checking if you authenticated"
    );
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "Inline Protected");
    cy.get("#target #data").should(
      "contain.text",
      JSON.stringify({ param: "something" })
    );
  });

  it("inline - authentication fails immediately", () => {
    // /inline-protected-false
    cy.get("input#url-input").type("/inline-protected-false{enter}");

    cy.get("#target #text").should(
      "contain.text",
      "Inline Sorry, you are NOT authenticated"
    );
  });

  it("inline - authentication passes immediately", () => {
    // /inline-protected-true/:param
    cy.get("input#url-input").type("/inline-protected-true/something{enter}");

    cy.get("#target #text").should("contain.text", "Inline Protected");
    cy.get("#target #data").should(
      "contain.text",
      JSON.stringify({ param: "something" })
    );
  });

  it("inline - lazy with params works", () => {
    // /inline-loading/:param
    cy.get("input#url-input").type("/inline-loading/hello{enter}");

    cy.get("#target #text").should("contain.text", "Inline Loading...");
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "I'm Lazy");
    cy.get("#target #data").should(
      "contain.text",
      JSON.stringify({ param: "hello" })
    );
  });

  it("inline - lazy fail works", () => {
    // /inline-loading-fail
    cy.get("input#url-input").type("/inline-loading-fail{enter}");

    cy.get("#target #text").should("contain.text", "Inline Loading...");
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "Inline Error");
    cy.get("#target #data").should("contain.text", "a fail");
  });

  it("authRedirect -- immediate failing", () => {
    // /redirect
    cy.get("input#url-input").type("/redirect{enter}");

    cy.get("#target #text").should("contain.text", "I'm main");

    cy.location("pathname").should("eq", "/");
  });

  it("authRedirect -- fail after 1s", () => {
    // /wait-redirect
    cy.get("input#url-input").type("/wait-redirect{enter}");

    cy.get("#target #text").should(
      "contain.text",
      "Checking if you authenticated"
    );
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "I'm main");
    cy.location("pathname").should("eq", "/");
  });

  it("authRedirect -- inline -- immediate failing", () => {
    // /inline-redirect
    cy.get("input#url-input").type("/inline-redirect{enter}");

    cy.get("#target #text").should("contain.text", "Inline Params");
    cy.location("pathname").should("eq", "/inline");
  });

  it("authRedirect -- inline -- fail after 1s", () => {
    // /inline-redirect
    cy.get("input#url-input").type("/inline-wait-redirect{enter}");

    cy.get("#target #text").should(
      "contain.text",
      "Checking if you authenticated"
    );
    cy.wait(1000);
    cy.get("#target #text").should("contain.text", "Inline Params");
    cy.location("pathname").should("eq", "/inline");
  });
});
