const template = require('@babel/template').default;
const types = require('@babel/types');

const S_AREA = '$area';
const S_SCOPE = '$scope';
const S_GETTER = '_get';
const S_SETTER = '_set';
const S_ACTION = '_action';
const S_EVENT = '$event';
const S_VIEW_GETTER = '$';

const buildStyleDisplayNode = template("TEST ? '' : 'none'");
const buildFlowNode = template('[() => { return TEST }, () => { return NODE }]');
const buildDefaultFlowNode = template('[true, () => { return NODE }]');
const buildSingleFlowNode = template('TEST ? NODE : null');
const buildExprNode = template(`${S_AREA}.expr(ID, (${S_SCOPE},${S_AREA}) => { return EXPR })`);
const buildFlows = template(`${S_AREA}.flows(FLOWS)`);
const buildAreaNormal = template(`${S_AREA}.area(AID, (${S_AREA}) => { return NODE })`);
const buildVirutalArea = template(`${S_AREA}.area(AID, (${S_AREA}) => { return NODE }, true)`);
function buildArea({ NODE, VIRTUAL = false }) {
  if (VIRTUAL) {
    return buildVirutalArea({ NODE });
  }
  return buildAreaNormal({ NODE });
}
const buildNormalLoop = template(`${S_AREA}.loop(AID, DATA, DELEGATE)`);
const buildVirutalLoop = template(`${S_AREA}.loop(AID, DATA, DELEGATE, true)`);
function buildLoop({
  AID, DATA, DELEGATE, VIRTUAL = false,
}) {
  if (VIRTUAL) {
    return buildVirutalLoop({ AID, DATA, DELEGATE });
  }
  return buildNormalLoop({ AID, DATA, DELEGATE });
}

const buildDelegate = template(`(${S_AREA}, key, $each) => {
  const $id = xId($each, key);
  return ${S_AREA}.fork({
    $id,
    $each,
    ITEM: $each,
    INDEX: key
  }, (${S_AREA}) => NODE)
}`);

const buildProps = template(`(${S_SCOPE},${S_AREA}) => { return PROPS }`);
const buildAreaRender = template(`(${S_AREA}) => { return VIEW }`);

const buildViewNormal = template(`${S_AREA}.view(ID)`);
const buildViewWithProps = template(`${S_AREA}.view(ID, PROPS)`);
const buildViewWithPropsChildren = template(`${S_AREA}.view(ID, PROPS, CHILDREN)`);
const buildViewWithPropsChildrenSlots = template(`${S_AREA}.view(ID, PROPS, CHILDREN, SLOTS)`);

function buildView({
  ID, PROPS, CHILDREN, SLOTS,
}) {
  if (SLOTS) {
    return buildViewWithPropsChildrenSlots({
      ID,
      PROPS: PROPS || types.nullLiteral(),
      CHILDREN: CHILDREN || types.nullLiteral(),
      SLOTS,
    });
  }
  if (CHILDREN) {
    return buildViewWithPropsChildren({
      ID,
      PROPS: PROPS || types.nullLiteral(),
      CHILDREN,
    });
  }
  if (PROPS) {
    return buildViewWithProps({
      ID,
      PROPS,
    });
  }
  return buildViewNormal({
    ID,
  });
}

const buildRouterViewNodeNormal = template(`${S_AREA}.router(VID)`);
const buildRouterViewNodeWithProps = template(`${S_AREA}.router(VID, PROPS)`);

function buildRouterViewNode({ VID, PROPS }) {
  if (PROPS) {
    return buildRouterViewNodeWithProps({
      PROPS,
      VID,
    });
  }
  return buildRouterViewNodeNormal({
    VID,
  });
}

const buildActionNormal = template(`${S_SCOPE}._action(ACTION)`);
const buildActionWithModifiers = template(`${S_SCOPE}._action([xModifiers(MODIFIERS), ACTION])`);

function buildAction({ ACTION, MODIFIERS }) {
  if (MODIFIERS) {
    return buildActionWithModifiers({
      ACTION,
      MODIFIERS,
    });
  }
  return buildActionNormal({
    ACTION,
  });
}

const buildViewRender = template('function ViewRender(controller) { return VIEW }');
const buildPortalView = template(`controller.$root.render((${S_AREA}) => { return VIEW })`);

module.exports = {
  S_ACTION,
  S_SCOPE,
  S_AREA,
  S_GETTER,
  S_SETTER,
  S_VIEW_GETTER,
  S_EVENT,
  buildStyleDisplayNode: data => buildStyleDisplayNode(data).expression,
  buildFlowNode: data => buildFlowNode(data).expression,
  buildDefaultFlowNode: data => buildDefaultFlowNode(data).expression,
  buildSingleFlowNode: data => buildSingleFlowNode(data).expression,
  buildExprNode: data => buildExprNode(data).expression,
  buildFlows: data => buildFlows(data).expression,
  buildArea: data => buildArea(data).expression,
  buildLoop: data => buildLoop(data).expression,
  buildDelegate: data => buildDelegate(data).expression,
  buildProps: data => buildProps(data).expression,
  buildAreaRender: data => buildAreaRender(data).expression,
  buildView: data => buildView(data).expression,
  buildAction: data => buildAction(data).expression,
  buildRouterViewNode: data => buildRouterViewNode(data).expression,
  buildPortalView: data => buildPortalView(data).expression,
  buildViewRender,
};
