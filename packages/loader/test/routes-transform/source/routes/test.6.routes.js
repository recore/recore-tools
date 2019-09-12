export default {
  baseDir: './biz',
  routes: [
    {
      path: '/bogda/suit/:suitId/mediateForm/:formType(create)',
      main: 'mediate/mediateForm',
    },
    {
      path: '/bogda/suit/:suitId/mediateForm/:formType(update|view|copy)/:mediateId',
      main: 'mediate/mediateForm',
    },
    {
      path: '/bogda/suit/courtRecord.htm',
      main: './courtRecord',
    },
  ],
};
