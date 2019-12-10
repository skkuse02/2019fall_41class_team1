package edu.skku.SE.balancedone;

import android.graphics.Color;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;

import com.github.mikephil.charting.charts.RadarChart;
import com.github.mikephil.charting.components.Description;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.components.YAxis;
import com.github.mikephil.charting.data.RadarData;
import com.github.mikephil.charting.data.RadarDataSet;
import com.github.mikephil.charting.data.RadarEntry;
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter;
import com.github.mikephil.charting.utils.ColorTemplate;

import java.util.ArrayList;

public class FoodRecommendation extends AppCompatActivity {

    RadarChart RadarChart;
    RadarData radarData;
    RadarDataSet radarDataSet;
    ArrayList radarEntries;
    TextView RecommendedFood;
    ImageView pastFood1;
    ImageView pastFood2;
    ImageView pastFood3;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_foodrecommendation);

        pastFood1 = findViewById(R.id.imageView);
        pastFood2 = findViewById(R.id.imageView2);
        pastFood3 = findViewById(R.id.imageView3);

        /*                                                                                          //주석 풀고 이전에 먹은 음식 사진 입력(현재 기본이미지)
        pastFood1.setImageBitmap();
        pastFood2.setImageBitmap();
        pastFood3.setImageBitmap();
        */

        RadarChart = findViewById(R.id.RadarChart);
        RecommendedFood = findViewById(R.id.textView);
        String Foodname = "Pizza";                                                                 //추천음식명 입력(현재 그냥 pizza로 설정)
        String RecommendString = "We Recommend " + Foodname;
        RecommendedFood.setText(RecommendString);
        RecommendedFood.setTextSize(30f);

        getEntries();
        radarDataSet = new RadarDataSet(radarEntries, "Nutrition Status");
        RadarChart.getDescription().setEnabled(false);
        RadarChart.setRotationAngle(60);
        RadarChart.setRotationEnabled(false);
        String[] labels = {"Calcium","VitaminA","VitaminB","VitaminC","Protein","Calorie"};
        XAxis xAxis = RadarChart.getXAxis();
        xAxis.setValueFormatter(new IndexAxisValueFormatter(labels));
        xAxis.setTextSize(15);
        YAxis yAxis = RadarChart.getYAxis();
        yAxis.setAxisMinimum(0);
        radarData = new RadarData(radarDataSet);
        RadarChart.setData(radarData);
        RadarChart.getLegend().setEnabled(false);
        radarDataSet.setColors(Color.BLUE);                                                       //그래프 색, 가독성 측면에서 파랑으로 설정해둠
        radarDataSet.setValueTextColor(Color.BLACK);
        radarDataSet.setValueTextSize(15);
    }

    private void getEntries() {
        radarEntries = new ArrayList<>();
        radarEntries.add(new RadarEntry(3, "cal"));                                  //칼슘량 value에 입력 (현재 임의의 값 들어있음)
        radarEntries.add(new RadarEntry(3, "vitA"));                                 //비타민A양 value에 입력 (현재 임의의 값 들어있음)
        radarEntries.add(new RadarEntry(4, "vitB"));                                 //비타민B양 value에 입력 (현재 임의의 값 들어있음)
        radarEntries.add(new RadarEntry(5, "vitC"));                                 //비타민C양 value에 입력 (현재 임의의 값 들어있음)
        radarEntries.add(new RadarEntry(3, "pro"));                                  //단백질량 value에 입력 (현재 임의의 값 들어있음)
        radarEntries.add(new RadarEntry(4, "calo"));                                 //칼로리양 value에 입력 (현재 임의의 값 들어있음)
    }

}