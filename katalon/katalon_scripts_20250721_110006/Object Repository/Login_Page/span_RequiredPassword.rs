<?xml version="1.0" encoding="UTF-8"?>
<WebElementEntity>
   <description>Required field validation for password</description>
   <name>span_RequiredPassword</name>
   <tag></tag>
   <elementGuidId>90123456-ijkl-9012-mnop-90123456abcd</elementGuidId>
   <selectorCollection>
      <entry>
         <key>BASIC</key>
         <value>//input[@name='password']/following::span[contains(@class, 'error-message') and contains(text(), 'Required')]</value>
      </entry>
      <entry>
         <key>CSS</key>
         <value>div:has(> input[name='password']) + span.oxd-input-field-error-message</value>
      </entry>
      <entry>
         <key>XPATH</key>
         <value>//input[@name='password']/following::span[contains(@class, 'error-message') and contains(text(), 'Required')]</value>
      </entry>
   </selectorCollection>
   <selectorMethod>XPATH</selectorMethod>
   <useRalativeImagePath>false</useRalativeImagePath>
   <webElementProperties>
      <isSelected>true</isSelected>
      <matchCondition>equals</matchCondition>
      <name>tag</name>
      <type>Main</type>
      <value>span</value>
      <webElementGuid>12345678-1234-5678-1234-567890abcdef</webElementGuid>
   </webElementProperties>
   <webElementProperties>
      <isSelected>true</isSelected>
      <matchCondition>contains</matchCondition>
      <name>class</name>
      <type>Main</type>
      <value>error-message</value>
      <webElementGuid>23456789-2345-6789-2345-6789abcdefgh</webElementGuid>
   </webElementProperties>
   <webElementProperties>
      <isSelected>true</isSelected>
      <matchCondition>equals</matchCondition>
      <name>text</name>
      <type>Main</type>
      <value>Required</value>
      <webElementGuid>34567890-3456-7890-3456-7890abcdefgh</webElementGuid>
   </webElementProperties>
</WebElementEntity>