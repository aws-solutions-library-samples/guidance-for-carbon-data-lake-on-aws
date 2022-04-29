*Copyright Amazon.com, Inc.  This package is confidential and proprietary Amazon.com, Inc. software.*

# Introduction

This package sets up a React development environment that has access to all [AWS-UI Polaris](https://polaris.a2z.com/) React components. It comes with four templates of frequently found pages in Polaris and AWS Management Console. With minimal setup, designers can construct clickable mockups using the building blocks our design system has to offer. Bob Ross makes it easy to develop locally, running a webserver that previews your prototype and updates whenever you make and save changes. For more information and helpful tricks, see [Bob Ross in the AWS Design System](https://polaris.a2z.com/resources/bob_ross/).

## React + Babel/ES6 + React Scripts

This is a modern JS skeleton with React AWS-UI components for [React Scripts](https://create-react-app.dev/docs/available-scripts).

## Installation

Clone this repo manually `git clone ssh://git.amazon.com/pkg/BobRoss` or download it as a [.zip file on Drive](https://drive.corp.amazon.com/documents/aws-ux/Polaris/bob_ross/BobRoss.zip).

## Getting started

* Prereqs:
    * [Node.js](http://nodejs.org): if you don't already have it, run `brew install node` to download Node
* Run:
    * [First time] `npm install` - downloads app dependencies
    * `npm start` — watches the project with continuous rebuild. This will also launch HTTP server with [pushState](https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Manipulating_the_browser_history).
    * `npm run build` — builds a minified project for production
* Learn:
    * source files are fully auto-generated and served by HTTP server.  Write your code in `src/` dir.
    * Place static files in `public/`
