<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="销量" prop="sales">
        <el-input
          v-model="queryParams.sales"
          placeholder="请输入销量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status" style="width: 200px;">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable>
          <el-option
            v-for="dict in goods_status"
            :key="dict.value"
            :label="dict.label==1?'上架':'下架'"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeCreateTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="更新时间" style="width: 308px">
        <el-date-picker
          v-model="daterangeUpdateTime"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="库存" prop="stock">
        <el-input
          v-model="queryParams.stock"
          placeholder="请输入库存"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['system:integral-goods:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:integral-goods:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:integral-goods:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['system:integral-goods:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="integral_goodsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" :index="1" label="ID" align="center" prop="id" />
      <el-table-column label="名称" align="center" prop="name" />
      <el-table-column label="封面" align="center" prop="image" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="销量" align="center" prop="sales" />
      <el-table-column label="商品排序" align="center" prop="weigh" />
      <el-table-column label="是否显示" align="center" prop="status">
        <template #default="scope">
           <el-switch @change="isShowHandle(scope.row)" v-model="scope.row.status" active-value="1" inactive-value="0"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价格" align="center" prop="price" />
      <el-table-column label="库存" align="center" prop="stock" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:integral-goods:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:integral-goods:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改积分商品对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="integral-goodsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="封面" prop="image">
          <image-upload  @customUpload="(url)=>handleUpload(url,'cover')" v-model="form.image" :limit="1"/>
        </el-form-item>
        <el-form-item label="相册" prop="images">
          <image-upload @customUpload="(url)=>handleUpload(url,'album')" v-model="form.images"/>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="1">上架</el-radio>
            <el-radio value="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="富文本" prop="infoContent">
          <editor v-model="form.infoContent" :min-height="192"/>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input v-model="form.stock" placeholder="请输入库存" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Integral-goods">
import { listIntegral_goods, getIntegral_goods, delIntegral_goods, addIntegral_goods, updateIntegral_goods } from "@/api/system/integral-goods";
import {client} from '@/utils/alioss'
const { proxy } = getCurrentInstance();
const { goods_status } = proxy.useDict('goods_status');

const integral_goodsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateTime = ref([]);
const daterangeUpdateTime = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    image: null,
    sales: null,
    weigh: null,
    status: null,
    createTime: null,
    updateTime: null,
    infoContent: null,
    price: null,
    stock: null
  },
  rules: {
    name: [
      { required: true, message: "名称不能为空", trigger: "blur" }
    ],
    image: [
      { required: true, message: "封面不能为空", trigger: "blur" }
    ],
    images: [
      { required: true, message: "相册不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    infoContent: [
      { required: true, message: "富文本不能为空", trigger: "blur" }
    ],
    price: [
      { required: true, message: "价格不能为空", trigger: "blur" }
    ],
    stock: [
      { required: true, message: "库存不能为空", trigger: "blur" }
    ],
    sales: [
      { required: true, message: "销量不能为空", trigger: "blur" }
    ],
    weigh: [
      { required: true, message: "商品排序不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询积分商品列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
  if (null != daterangeUpdateTime && '' != daterangeUpdateTime) {
    queryParams.value.params["beginUpdateTime"] = daterangeUpdateTime.value[0];
    queryParams.value.params["endUpdateTime"] = daterangeUpdateTime.value[1];
  }
  listIntegral_goods(queryParams.value).then(response => {
    integral_goodsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    adminId: null,
    name: null,
    image: null,
    images: [],
    details: null,
    hits: null,
    likes: null,
    sales: null,
    weigh: null,
    status: null,
    createTime: null,
    updateTime: null,
    deleteTime: null,
    infoContent: null,
    minPrice: null,
    maxPrice: null,
    isNew: null,
    price: null,
    stock: null
  };
  proxy.resetForm("integral-goodsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeCreateTime.value = [];
  daterangeUpdateTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

const handleUpload = (url,source) => {
  console.log('积分url：',url);
  console.log('区分',source);
  if(source === 'cover'){
    form.value.image = url
  }else {
    form.value.images.push(url)
  }
};

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加积分商品";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getIntegral_goods(_id).then(response => {
    form.value = response.data;
    console.log('form数据',form.value);
    
    open.value = true;
    title.value = "修改积分商品";
  });
}

/** 提交按钮 */
function submitForm() {
  console.log('form数据',form.value);
  proxy.$refs["integral-goodsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateIntegral_goods(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        form.value.images = form.value.images.join(',');
        addIntegral_goods(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除积分商品编号为"' + _ids + '"的数据项？').then(function() {
    return delIntegral_goods(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/integral-goods/export', {
    ...queryParams.value
  }, `integral-goods_${new Date().getTime()}.xlsx`)
}


const isShowHandle = async (row)=>{

 const res = await updateIntegral_goods(row);

 console.log('修改显示',res);
}
getList();
</script>
