package edu.skku.SE.balancedone;

import android.Manifest;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Matrix;
import android.net.Uri;
import android.provider.MediaStore;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import com.gun0912.tedpermission.PermissionListener;
import com.gun0912.tedpermission.TedPermission;
import android.view.View;
import android.widget.ImageView;

import java.io.IOException;
import java.util.ArrayList;

public class FoodUpload extends AppCompatActivity {

    ImageView image;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_foodupload);

        image = findViewById(R.id.imageView);

        tedPermission();

        findViewById(R.id.btnGallery).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                imageFromGallery();
            }
        });

        findViewById(R.id.btnCamera).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                imageFromCamera();
            }
        });
    }

    private void imageFromGallery() {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setType(MediaStore.Images.Media.CONTENT_TYPE);
        startActivityForResult(intent, 1);
    }

    private void imageFromCamera(){
        Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        startActivityForResult(intent, 2);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent intent){
        Uri filepath;
        if(requestCode == 1){
            filepath = intent.getData();
            if(filepath != null){
                try{
                    Bitmap photo = MediaStore.Images.Media.getBitmap(getContentResolver(), filepath);
                    Matrix matrix = new Matrix();
                    matrix.postRotate(360);
                    Bitmap photoRotate = Bitmap.createBitmap(photo, 0, 0, photo.getWidth(), photo.getHeight(), matrix, false);
                    photo.recycle();
                    image.setImageBitmap(photoRotate);                                              //이 이미지(PhotoRotate)를 서버에 전달해야함
                }catch (IOException e){
                    e.printStackTrace();
                }
            }
        }
        else if(requestCode == 2){
            Bitmap photo = (Bitmap) intent.getExtras().get("data");
            if(photo != null){
                int scale = 2000;

                float width = photo.getWidth();
                float height = photo.getHeight();

                float newHightf = (scale*height)/width;
                int newHeight = (int) newHightf;
                Bitmap photoResize = Bitmap.createScaledBitmap(photo, scale, newHeight, true);
                photo.recycle();

                Matrix matrix = new Matrix();
                matrix.postRotate(360);
                Bitmap photoRotate = Bitmap.createBitmap(photoResize, 0, 0, photoResize.getWidth(), photoResize.getHeight(), matrix, false);
                photoResize.recycle();

                image.setImageBitmap(photoRotate);                                                 //이 이미지(PhotoRotate)를 서버에 전달해야함
            }
        }
    }

    private void tedPermission() {

        PermissionListener permissionListener = new PermissionListener() {
            @Override
            public void onPermissionGranted() {
            }

            @Override
            public void onPermissionDenied(ArrayList<String> deniedPermissions) {
            }
        };

        TedPermission.with(this)
                .setPermissionListener(permissionListener)
                .setDeniedMessage("Denied")
                .setPermissions(Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.CAMERA)
                .check();
    }
}