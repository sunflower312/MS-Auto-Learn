import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export function RouteLoadingState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>页面加载中</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">正在准备当前页面内容。</p>
      </CardContent>
    </Card>
  );
}
