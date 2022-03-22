"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluate_cloudformation_template_1 = require("../../lib/api/evaluate-cloudformation-template");
const mock_sdk_1 = require("../util/mock-sdk");
describe('Lazy ListStackResources', () => {
    test('correctly caches calls to the CloudFormation API', async () => {
        // GIVEN
        const listStackResMock = jest.fn();
        const mockSdk = new mock_sdk_1.MockSdk();
        mockSdk.stubCloudFormation({
            listStackResources: listStackResMock,
        });
        listStackResMock.mockReturnValue({
            StackResourceSummaries: [],
            NextToken: undefined,
        });
        const res = new evaluate_cloudformation_template_1.LazyListStackResources(mockSdk, 'StackName');
        // WHEN
        void res.listStackResources();
        void res.listStackResources();
        void res.listStackResources();
        const result = await res.listStackResources();
        // THEN
        expect(result.length).toBe(0);
        expect(listStackResMock).toHaveBeenCalledTimes(1);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eS1saXN0LXN0YWNrLXJlc291cmNlcy50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGF6eS1saXN0LXN0YWNrLXJlc291cmNlcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EscUdBQXdGO0FBQ3hGLCtDQUEyQztBQUUzQyxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO0lBQ3ZDLElBQUksQ0FBQyxrREFBa0QsRUFBRSxLQUFLLElBQUksRUFBRTtRQUNsRSxRQUFRO1FBQ1IsTUFBTSxnQkFBZ0IsR0FBeUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3pJLE1BQU0sT0FBTyxHQUFHLElBQUksa0JBQU8sRUFBRSxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQztZQUN6QixrQkFBa0IsRUFBRSxnQkFBZ0I7U0FDckMsQ0FBQyxDQUFDO1FBQ0gsZ0JBQWdCLENBQUMsZUFBZSxDQUFDO1lBQy9CLHNCQUFzQixFQUFFLEVBQUU7WUFDMUIsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxHQUFHLEdBQUcsSUFBSSx5REFBc0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFN0QsT0FBTztRQUNQLEtBQUssR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDOUIsS0FBSyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztRQUM5QixLQUFLLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzlCLE1BQU0sTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFOUMsT0FBTztRQUNQLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBBV1MgZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgeyBMYXp5TGlzdFN0YWNrUmVzb3VyY2VzIH0gZnJvbSAnLi4vLi4vbGliL2FwaS9ldmFsdWF0ZS1jbG91ZGZvcm1hdGlvbi10ZW1wbGF0ZSc7XG5pbXBvcnQgeyBNb2NrU2RrIH0gZnJvbSAnLi4vdXRpbC9tb2NrLXNkayc7XG5cbmRlc2NyaWJlKCdMYXp5IExpc3RTdGFja1Jlc291cmNlcycsICgpID0+IHtcbiAgdGVzdCgnY29ycmVjdGx5IGNhY2hlcyBjYWxscyB0byB0aGUgQ2xvdWRGb3JtYXRpb24gQVBJJywgYXN5bmMgKCkgPT4ge1xuICAgIC8vIEdJVkVOXG4gICAgY29uc3QgbGlzdFN0YWNrUmVzTW9jazogamVzdC5Nb2NrPEFXUy5DbG91ZEZvcm1hdGlvbi5MaXN0U3RhY2tSZXNvdXJjZXNPdXRwdXQsIEFXUy5DbG91ZEZvcm1hdGlvbi5MaXN0U3RhY2tSZXNvdXJjZXNJbnB1dFtdPiA9IGplc3QuZm4oKTtcbiAgICBjb25zdCBtb2NrU2RrID0gbmV3IE1vY2tTZGsoKTtcbiAgICBtb2NrU2RrLnN0dWJDbG91ZEZvcm1hdGlvbih7XG4gICAgICBsaXN0U3RhY2tSZXNvdXJjZXM6IGxpc3RTdGFja1Jlc01vY2ssXG4gICAgfSk7XG4gICAgbGlzdFN0YWNrUmVzTW9jay5tb2NrUmV0dXJuVmFsdWUoe1xuICAgICAgU3RhY2tSZXNvdXJjZVN1bW1hcmllczogW10sXG4gICAgICBOZXh0VG9rZW46IHVuZGVmaW5lZCxcbiAgICB9KTtcbiAgICBjb25zdCByZXMgPSBuZXcgTGF6eUxpc3RTdGFja1Jlc291cmNlcyhtb2NrU2RrLCAnU3RhY2tOYW1lJyk7XG5cbiAgICAvLyBXSEVOXG4gICAgdm9pZCByZXMubGlzdFN0YWNrUmVzb3VyY2VzKCk7XG4gICAgdm9pZCByZXMubGlzdFN0YWNrUmVzb3VyY2VzKCk7XG4gICAgdm9pZCByZXMubGlzdFN0YWNrUmVzb3VyY2VzKCk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzLmxpc3RTdGFja1Jlc291cmNlcygpO1xuXG4gICAgLy8gVEhFTlxuICAgIGV4cGVjdChyZXN1bHQubGVuZ3RoKS50b0JlKDApO1xuICAgIGV4cGVjdChsaXN0U3RhY2tSZXNNb2NrKS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSk7XG4gIH0pO1xufSk7XG4iXX0=