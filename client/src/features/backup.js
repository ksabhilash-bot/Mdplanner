  {/* Meal Progress Section */}
          {/* <Card className="flex-1">
            <CardHeader>
              <CardTitle>Meal Progress</CardTitle>
            </CardHeader>
            <CardContent className="h-full">
              <div className="grid grid-cols-2 gap-3 h-full">
                {["breakfast", "lunch", "snack", "dinner"].map((mealType) => {
                  const isCompleted = isMealCompleted(mealType);
                  const consumed = getMealConsumed(mealType);
                  const target = mealDistribution[mealType] || {};

                  return (
                    <div
                      key={mealType}
                      className={`p-3 rounded-lg border ${
                        isCompleted
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between h-full">
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize text-gray-800">
                            {mealType}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {consumed.calories || 0}
                            <span className="text-sm font-normal text-gray-700">
                              {" "}
                              / {target.calories || 0} cal
                            </span>
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className={`h-1.5 rounded-full ${
                                isCompleted ? "bg-green-500" : "bg-gray-400"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  target.calories
                                    ? (consumed.calories / target.calories) *
                                        100
                                    : 0
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate("/nutrition/track", {
                                  state: {
                                    mealType,
                                    date: format(selectedDate, "yyyy-MM-dd"),
                                  },
                                })
                              }
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card> */}


{/* Meal-wise Breakdown Chart */}
          {mealChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Meal Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mealChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mealType" />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-4 border rounded-lg shadow-sm">
                              <p className="font-medium">{label}</p>
                              <p className="text-sm">
                                <span className="text-[#8884d8]">Target:</span>{" "}
                                {payload[0].payload.target} cal
                              </p>
                              <p className="text-sm">
                                <span className="text-[#82ca9d]">
                                  Consumed:
                                </span>{" "}
                                {payload[0].payload.consumed} cal
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">Foods:</span>{" "}
                                {payload[0].payload.foods} items
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="target"
                      fill="#8884d8"
                      name="Target Calories"
                    />
                    <Bar
                      dataKey="consumed"
                      fill="#82ca9d"
                      name="Consumed Calories"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

{
  /* Daily Calorie Progress Chart */
}
<Card>
  <CardHeader>
    <CardTitle>
      {nutritionGoals
        ? "Daily Calorie Progress"
        : "Calorie Progress (Last 7 Days)"}
    </CardTitle>
  </CardHeader>
  <CardContent className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tickFormatter={(value) => {
            const item = chartData.find((item) => item.name === value);
            return item ? item.shortName : value;
          }}
        />
        <YAxis />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-4 border rounded-lg shadow-sm">
                  <p className="font-medium">{label}</p>
                  <p className="text-sm">
                    <span className="text-[#8884d8]">Target:</span>{" "}
                    {payload[0].payload.target} cal
                  </p>
                  <p className="text-sm">
                    <span className="text-[#82ca9d]">Consumed:</span>{" "}
                    {payload[0].payload.consumed} cal
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="target"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          name="Target Calories"
        />
        <Line
          type="monotone"
          dataKey="consumed"
          stroke="#82ca9d"
          name="Consumed Calories"
        />
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>;
