from rest_framework import serializers

from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["id", "category", "amount", "date", "note", "created_by", "created_at"]
        read_only_fields = ["created_by", "created_at"]
