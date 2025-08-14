// import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { format, parseISO, isSameDay, isToday, addDays } from 'date-fns';
// import { Button } from '@/components/ui/button';
// import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
// import { Progress } from '@/components/ui/progress';
// import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// // Mock API functions
// const fetchUserProfile = async () => ({
//   name: "John Doe",
//   goal: "Weight Loss",
//   targetCalories: 1800,
//   progress: 65,
//   dietaryPreference: "Vegetarian"
// });

// const fetchMealPlan = async () => ({
//   planName: "Balanced Weight Loss",
//   dailyCalories: 1800,
//   macros: { protein: 140, carbs: 180, fats: 50 },
//   meals: [
//     {
//       date: new Date().toISOString(),
//       breakfast: {
//         meal: "Greek Yogurt with Berries",
//         calories: 300,
//         protein: 20,
//         completed: true
//       },
//       lunch: {
//         meal: "Quinoa Salad with Chickpeas",
//         calories: 450,
//         protein: 18,
//         completed: false
//       },
//       dinner: {
//         meal: "Grilled Salmon with Vegetables",
//         calories: 550,
//         protein: 35,
//         completed: false
//       }
//     }
//   ]
// });

// const fetchWeeklySummary = async () => ({
//   daysCompleted: 4,
//   totalDays: 7,
//   caloriesConsumed: 6200,
//   targetCalories: 12600,
//   averageProtein: 110,
//   averageCarbs: 165,
//   averageFats: 45
// });

// export default function DashboardContent() {
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [activeTab, setActiveTab] = useState('dashboard');

//   // Fetch user data
//   const { data: userProfile } = useQuery({
//     queryKey: ['userProfile'],
//     queryFn: fetchUserProfile
//   });

//   // Fetch meal plan
//   const { data: mealPlan } = useQuery({
//     queryKey: ['mealPlan'],
//     queryFn: fetchMealPlan
//   });

//   // Fetch weekly summary
//   const { data: weeklySummary } = useQuery({
//     queryKey: ['weeklySummary'],
//     queryFn: fetchWeeklySummary
//   });

//   // Get today's meals
//   const todaysMeals = mealPlan?.meals?.find(day =>
//     isSameDay(parseISO(day.date), selectedDate)
//   );

//   // Calculate daily progress
//   const calculateDailyProgress = () => {
//     if (!todaysMeals) return 0;
//     const completedMeals = Object.values(todaysMeals)
//       .filter(meal => typeof meal === 'object' && meal.completed)
//       .length;
//     return Math.round((completedMeals / 3) * 100);
//   };

//   return (
//     <div className="p-6">
//       {/* Dashboard Content */}
//       {activeTab === 'dashboard' && (
//         <div className="space-y-6">
//           {/* Daily Progress */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Today's Progress</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex justify-between mb-2">
//                     <span className="text-sm font-medium">Daily Completion</span>
//                     <span className="text-sm font-medium">{calculateDailyProgress()}%</span>
//                   </div>
//                   <Progress value={calculateDailyProgress()} className="h-2" />
//                 </div>

//                 <div className="grid grid-cols-3 gap-4">
//                   <div className="bg-primary/5 p-4 rounded-lg text-center">
//                     <p className="text-2xl font-bold">{userProfile?.targetCalories}</p>
//                     <p className="text-sm text-gray-500">Target Calories</p>
//                   </div>
//                   <div className="bg-primary/5 p-4 rounded-lg text-center">
//                     <p className="text-2xl font-bold">{mealPlan?.macros.protein}g</p>
//                     <p className="text-sm text-gray-500">Protein</p>
//                   </div>
//                   <div className="bg-primary/5 p-4 rounded-lg text-center">
//                     <p className="text-2xl font-bold">{userProfile?.dietaryPreference}</p>
//                     <p className="text-sm text-gray-500">Diet Type</p>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Weekly Summary */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Weekly Summary</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="bg-green-50 p-4 rounded-lg">
//                   <p className="text-2xl font-bold">{weeklySummary?.daysCompleted}/{weeklySummary?.totalDays}</p>
//                   <p className="text-sm text-gray-500">Days Completed</p>
//                 </div>
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <p className="text-2xl font-bold">{Math.round((weeklySummary?.caloriesConsumed / weeklySummary?.targetCalories) * 100)}%</p>
//                   <p className="text-sm text-gray-500">Calories Goal</p>
//                 </div>
//                 <div className="bg-yellow-50 p-4 rounded-lg">
//                   <p className="text-2xl font-bold">{weeklySummary?.averageProtein}g</p>
//                   <p className="text-sm text-gray-500">Avg Protein</p>
//                 </div>
//                 <div className="bg-purple-50 p-4 rounded-lg">
//                   <p className="text-2xl font-bold">{weeklySummary?.averageCarbs}g</p>
//                   <p className="text-sm text-gray-500">Avg Carbs</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Today's Meals */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Today's Meals</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {todaysMeals ? (
//                 <div className="space-y-4">
//                   {['breakfast', 'lunch', 'dinner'].map(mealType => (
//                     <div key={mealType} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                       <div>
//                         <p className="font-medium capitalize">{mealType}</p>
//                         <p className="text-sm text-gray-500">
//                           {todaysMeals[mealType]?.meal} • {todaysMeals[mealType]?.calories} cal
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         {todaysMeals[mealType]?.completed ? (
//                           <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Completed</span>
//                         ) : (
//                           <Button variant="outline" size="sm">
//                             Mark Complete
//                           </Button>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-gray-500">No meals planned for today</p>
//               )}
//             </CardContent>
//             <CardFooter className="justify-center">
//               <Button variant="link" onClick={() => setActiveTab('meal-plan')}>
//                 View Full Meal Plan
//               </Button>
//             </CardFooter>
//           </Card>
//         </div>
//       )}

//       {/* Meal Plan Content */}
//       {activeTab === 'meal-plan' && (
//         <div className="space-y-6">
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <CardTitle>{mealPlan?.planName} Plan</CardTitle>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm text-gray-500">
//                     {format(new Date(), "MMM d, yyyy")}
//                   </span>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <Tabs defaultValue="today">
//                 <TabsList className="grid grid-cols-3 w-full md:w-auto">
//                   <TabsTrigger value="today">Today</TabsTrigger>
//                   <TabsTrigger value="week">This Week</TabsTrigger>
//                   <TabsTrigger value="month">This Month</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="today" className="mt-4">
//                   {todaysMeals ? (
//                     <div className="space-y-4">
//                       {['breakfast', 'lunch', 'dinner'].map(mealType => (
//                         <div key={mealType} className="p-4 border rounded-lg">
//                           <div className="flex justify-between items-start">
//                             <div>
//                               <h3 className="font-medium capitalize">{mealType}</h3>
//                               <p className="text-primary">{todaysMeals[mealType]?.meal}</p>
//                               <p className="text-sm text-gray-500 mt-1">
//                                 {todaysMeals[mealType]?.calories} cal • {todaysMeals[mealType]?.protein}g protein
//                               </p>
//                             </div>
//                             <div className="flex gap-2">
//                               <Button variant="outline" size="sm">
//                                 Swap
//                               </Button>
//                               <Button
//                                 variant={todaysMeals[mealType]?.completed ? "default" : "outline"}
//                                 size="sm"
//                               >
//                                 {todaysMeals[mealType]?.completed ? "Completed" : "Mark Complete"}
//                               </Button>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="text-gray-500">No meals planned for today</p>
//                   )}
//                 </TabsContent>

//                 <TabsContent value="week" className="mt-4">
//                   <div className="space-y-4">
//                     {[0,1,2,3,4,5,6].map(dayOffset => {
//                       const date = addDays(new Date(), dayOffset);
//                       const dayMeals = mealPlan?.meals?.find(day =>
//                         isSameDay(parseISO(day.date), date)
//                       );

//                       return (
//                         <div key={dayOffset} className="border rounded-lg overflow-hidden">
//                           <div className="bg-gray-50 px-4 py-2 border-b">
//                             <h3 className="font-medium">
//                               {format(date, "EEEE, MMMM d")}
//                               {isToday(date) && <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full">Today</span>}
//                             </h3>
//                           </div>
//                           {dayMeals ? (
//                             <div className="p-4 space-y-3">
//                               {['breakfast', 'lunch', 'dinner'].map(mealType => (
//                                 <div key={mealType} className="flex justify-between items-center">
//                                   <div>
//                                     <span className="capitalize text-sm text-gray-500">{mealType}: </span>
//                                     <span className="font-medium">{dayMeals[mealType]?.meal}</span>
//                                   </div>
//                                   <span className="text-sm text-gray-500">
//                                     {dayMeals[mealType]?.calories} cal
//                                   </span>
//                                 </div>
//                               ))}
//                             </div>
//                           ) : (
//                             <div className="p-4 text-sm text-gray-500">
//                               No meals planned
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </TabsContent>
//               </Tabs>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Reminders Content */}
//       {activeTab === 'reminders' && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4">Meal Reminders</h2>
//           <div className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Notification Settings</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-500">Configure your meal reminders and notifications</p>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       )}

//       {/* Settings Content */}
//       {activeTab === 'settings' && (
//         <div>
//           <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
//           <div className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Personal Information</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-500">Update your profile details and preferences</p>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

export default function userdashboard() {
  return <div>User dashboard</div>;
}
