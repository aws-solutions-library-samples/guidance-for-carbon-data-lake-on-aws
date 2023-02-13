"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codegen_1 = require("../lib/codegen");
const config = {
    emitLegacyCommonJSImports: false,
    generates: {
        './__generated__/activity.csv': {
            schema: './activity-schema.graphql',
            plugins: ['../lib/index.js'],
            config: {
                fileFormat: codegen_1.FileFormat.CSV,
            },
        },
    },
};
exports.default = config;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWdlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvZGVnZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSw0Q0FBNEM7QUFFNUMsTUFBTSxNQUFNLEdBQWtCO0lBQzVCLHlCQUF5QixFQUFFLEtBQUs7SUFDaEMsU0FBUyxFQUFFO1FBQ1QsOEJBQThCLEVBQUU7WUFDOUIsTUFBTSxFQUFFLDJCQUEyQjtZQUNuQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztZQUM1QixNQUFNLEVBQUU7Z0JBQ04sVUFBVSxFQUFFLG9CQUFVLENBQUMsR0FBRzthQUMzQjtTQUNGO0tBQ0Y7Q0FDRixDQUFDO0FBRUYsa0JBQWUsTUFBTSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29kZWdlbkNvbmZpZyB9IGZyb20gJ0BncmFwaHFsLWNvZGVnZW4vY2xpJztcbmltcG9ydCB7IEZpbGVGb3JtYXQgfSBmcm9tICcuLi9saWIvY29kZWdlbic7XG5cbmNvbnN0IGNvbmZpZzogQ29kZWdlbkNvbmZpZyA9IHtcbiAgZW1pdExlZ2FjeUNvbW1vbkpTSW1wb3J0czogZmFsc2UsXG4gIGdlbmVyYXRlczoge1xuICAgICcuL19fZ2VuZXJhdGVkX18vYWN0aXZpdHkuY3N2Jzoge1xuICAgICAgc2NoZW1hOiAnLi9hY3Rpdml0eS1zY2hlbWEuZ3JhcGhxbCcsXG4gICAgICBwbHVnaW5zOiBbJy4uL2xpYi9pbmRleC5qcyddLFxuICAgICAgY29uZmlnOiB7XG4gICAgICAgIGZpbGVGb3JtYXQ6IEZpbGVGb3JtYXQuQ1NWLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnOyJdfQ==